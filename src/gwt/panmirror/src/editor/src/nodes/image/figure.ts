/*
 * figure.ts
 *
 * Copyright (C) 2021 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { Node as ProsemirrorNode, Schema, Fragment, ResolvedPos } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';

import { findChildrenByType, findParentNodeClosestToPos } from 'prosemirror-utils';

import { Extension, ExtensionContext } from '../../api/extension';
import { FixupContext } from '../../api/fixup';
import { isSingleLineHTML } from '../../api/html';
import { getMarkAttrs } from '../../api/mark';
import {
  PandocToken,
  PandocTokenType,
  ProsemirrorWriter,
  kRawBlockContent,
  kRawBlockFormat,
  imageAttributesAvailable,
} from '../../api/pandoc';
import { trTransform } from '../../api/transaction';

import {
  imageAttrsFromDOM,
  imageNodeAttrsSpec,
  imageDOMOutputSpec,
  imagePandocOutputWriter,
  pandocImageHandler,
  imageAttrsFromHTML,
  imageCommand,
} from './image';
import { inlineHTMLIsImage } from './image-util';
import { imageNodeViewPlugins } from './image-view';
import { figureKeys } from './figure-keys';

const extension = (context: ExtensionContext): Extension => {
  const { pandocExtensions, ui, events } = context;

  const imageAttr = imageAttributesAvailable(pandocExtensions);

  return {
    nodes: [
      {
        name: 'figure',
        spec: {
          attrs: imageNodeAttrsSpec(true, imageAttr),
          content: 'inline*',
          group: 'block',
          draggable: true,
          selectable: true,
          defining: true,
          parseDOM: [
            {
              tag: 'figure',
              contentElement: 'figcaption',
              getAttrs(dom: Node | string) {
                const el = dom as Element;
                const img = el.querySelector('img');
                if (img && img.parentNode === dom) {
                  return imageAttrsFromDOM(img, imageAttr);
                } else {
                  return {
                    src: null,
                    title: null,
                  };
                }
              },
            },
          ],
          toDOM(node: ProsemirrorNode) {
            return ['figure', imageDOMOutputSpec(node, imageAttr), ['figcaption', { class: 'pm-figcaption' }, 0]];
          },
        },
        pandoc: {
          writer: imagePandocOutputWriter(true, ui),

          // intercept  paragraphs with a single image and process them as figures
          blockReader: (schema: Schema, tok: PandocToken, writer: ProsemirrorWriter) => {
            // helper to process html image
            const handleHTMLImage = (html: string) => {
              const attrs = imageAttrsFromHTML(html);
              if (attrs) {
                attrs.raw = true;
                writer.addNode(schema.nodes.figure, attrs, []);
                return true;
              } else {
                return false;
              }
            };

            // unroll figure from paragraph with single image
            if (isParaWrappingFigure(tok) && !writerHasProhibitedFigureParent(schema, writer)) {
              const handler = pandocImageHandler(true, imageAttr)(schema);
              handler(writer, tok.c[0]);
              return true;
              // unroll figure from html RawBlock with single <img> tag
            } else if (isHTMLImageBlock(tok)) {
              return handleHTMLImage(tok.c[kRawBlockContent]);
            } else {
              return false;
            }
          },
        },

        attr_edit: () => ({
          type: (schema: Schema) => schema.nodes.figure,
          editFn: () => imageCommand(ui, imageAttr),
        }),
      },
    ],

    fixups: (_schema: Schema) => {
      return [
        (tr: Transaction, fixupContext: FixupContext) => {
          if (fixupContext === FixupContext.Load) {
            return convertImagesToFigure(tr);
          } else {
            return tr;
          }
        },
      ];
    },

    appendTransaction: (schema: Schema) => {
      return [
        {
          name: 'figure-convert',
          nodeFilter: node => node.type === schema.nodes.image,
          append: convertImagesToFigure,
        },
      ];
    },

    baseKeys: figureKeys,

    plugins: (schema: Schema) => {
      return [...imageNodeViewPlugins('figure', ui, events, pandocExtensions)];
    },
  };
};

export function posHasProhibitedFigureParent(schema: Schema, $pos: ResolvedPos) {
  return prohibitedFigureParents(schema).some(type => {
    return !!findParentNodeClosestToPos($pos, node => node.type === type);
  });
}

export function writerHasProhibitedFigureParent(schema: Schema, writer: ProsemirrorWriter) {
  return prohibitedFigureParents(schema).some(writer.isNodeOpen);
}

function prohibitedFigureParents(schema: Schema) {
  return [schema.nodes.table_cell, schema.nodes.list_item, schema.nodes.definition_list];
}

function convertImagesToFigure(tr: Transaction) {
  return trTransform(tr, imagesToFiguresTransform);
}

function imagesToFiguresTransform(tr: Transform) {
  const schema = tr.doc.type.schema;
  const images = findChildrenByType(tr.doc, schema.nodes.image);
  images.forEach(image => {
    // position reflecting steps already taken in this handler
    const mappedImagePos = tr.mapping.mapResult(image.pos);

    // process image so long as it wasn't deleted by a previous step
    if (!mappedImagePos.deleted) {
      // resolve image pos
      const imagePos = tr.doc.resolve(mappedImagePos.pos);

      // if it's an image in a standalone paragraph, convert it to a figure
      if (
        imagePos.parent.type === schema.nodes.paragraph &&
        imagePos.parent.childCount === 1 &&
        !posHasProhibitedFigureParent(schema, imagePos)
      ) {
        // figure attributes
        const attrs = image.node.attrs;

        // extract linkTo from link mark (if any)
        if (schema.marks.link.isInSet(image.node.marks)) {
          const linkAttrs = getMarkAttrs(
            tr.doc,
            { from: mappedImagePos.pos, to: mappedImagePos.pos + image.node.nodeSize },
            schema.marks.link,
          );
          if (linkAttrs && linkAttrs.href) {
            attrs.linkTo = linkAttrs.href;
          }
        }

        // figure content
        const content = attrs.alt ? Fragment.from(schema.text(attrs.alt)) : Fragment.empty;

        // replace image with figure
        const figure = schema.nodes.figure.createAndFill(attrs, content);
        if (figure) {
          tr.replaceRangeWith(mappedImagePos.pos, mappedImagePos.pos + image.node.nodeSize, figure);
        }
      }
    }
  });
}

function isParaWrappingFigure(tok: PandocToken) {
  return isSingleChildParagraph(tok) && tok.c[0].t === PandocTokenType.Image;
}

function isHTMLImageBlock(tok: PandocToken) {
  if (tok.t === PandocTokenType.RawBlock) {
    const format = tok.c[kRawBlockFormat];
    const text = tok.c[kRawBlockContent] as string;
    return format === 'html' && isSingleLineHTML(text) && inlineHTMLIsImage(text);
  } else {
    return false;
  }
}

function isSingleChildParagraph(tok: PandocToken) {
  return tok.t === PandocTokenType.Para && tok.c && tok.c.length === 1;
}

export default extension;
