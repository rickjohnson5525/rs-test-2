/*
 * cite-completion_doi.tsx
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

import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';

import React from 'react';

import { EditorUI } from '../../api/ui';
import {
  CompletionHandler,
  CompletionResult,
  performCompletionReplacement,
  CompletionContext,
} from '../../api/completion';
import { formatAuthors, formatIssuedDate } from '../../api/cite';
import { CSL, imageForType } from '../../api/csl';
import { CompletionItemDetailedView } from '../../api/widgets/completion-detailed';
import { BibliographyManager } from '../../api/bibliography/bibliography';
import { EditorServer } from '../../api/server';
import { DOIServer } from '../../api/doi';

import { doiFromEditingContext } from './cite-doi';
import { insertCitation } from './cite';
import { kCitationCompleteScope } from './cite-completion';

const kCompletionWidth = 400;
const kCompletionItemPadding = 10;

export function citationDoiCompletionHandler(
  ui: EditorUI,
  bibManager: BibliographyManager,
  server: EditorServer,
): CompletionHandler<CSLEntry> {
  return {
    id: '56DA14DD-6E3A-4481-93A9-938DC00393A5',

    scope: kCitationCompleteScope,

    completions: citationDOICompletions(ui, server.doi, bibManager),

    replace(view: EditorView, pos: number, cslEntry: CSLEntry | null) {
      if (cslEntry && cslEntry.inBibliography) {
        // It's already in the bibliography, just write the id
        const tr = view.state.tr;
        const schema = view.state.schema;
        const id = schema.text(cslEntry.id, [schema.marks.cite_id.create()]);
        performCompletionReplacement(tr, pos, id);
        view.dispatch(tr);
      } else if (cslEntry) {
        // It isn't in the bibliography, show the insert cite dialog
        return insertCitation(view, cslEntry.csl.DOI || '', bibManager, pos, ui, server.pandoc, cslEntry.csl);
      }
      return Promise.resolve();
    },

    view: {
      component: CSLSourceView,
      key: cslEntry => cslEntry.csl.DOI,
      width: kCompletionWidth,
      height: 120,
      maxVisible: 5,
      hideNoResults: true,
    },
  };
}

const kPRogressDelay = 350;

function citationDOICompletions(ui: EditorUI, server: DOIServer, bibliographyManager: BibliographyManager) {
  return (_text: string, context: EditorState | Transaction): CompletionResult<CSLEntry> | null => {
    const parsedDOI = doiFromEditingContext(context);
    if (parsedDOI) {
      return {
        token: parsedDOI.token,
        pos: parsedDOI.pos,
        offset: parsedDOI.offset,
        completions: async (_state: EditorState, completionContext: CompletionContext) => {
          // If we have a local source that matches this DOI, just show the
          // completion for the entry
          await bibliographyManager.load(ui, context.doc);
          const source = bibliographyManager.findDoiInLocalBibliography(parsedDOI.token);
          if (source) {
            return [
              {
                id: source.id,
                csl: source,
                inBibliography: true,
                image: imageForType(ui.images, source.type)[ui.prefs.darkMode() ? 1 : 0],
                formattedAuthor: formatAuthors(source.author, 50),
                formattedIssueDate: formatIssuedDate(source.issued),
              },
            ];
          } else {
            return [];
          }
        },
      };
    }
    return null;
  };
}

interface CSLEntry {
  id: string;
  csl: CSL;
  inBibliography: boolean;
  image?: string;
  formattedAuthor: string;
  formattedIssueDate: string;
}

const CSLSourceView: React.FC<CSLEntry> = cslEntry => {
  const csl = cslEntry.csl;
  return (
    <CompletionItemDetailedView
      width={kCompletionWidth - kCompletionItemPadding}
      image={cslEntry.image}
      heading={csl['short-container-title'] || csl.publisher || ''}
      title={csl.title || ''}
      subTitle={`${cslEntry.formattedAuthor} ${cslEntry.formattedIssueDate}` || ''}
    />
  );
};
