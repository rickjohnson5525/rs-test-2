/*
 * bibliography-provider_zotero.ts
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
import { Node as ProsemirrorNode } from 'prosemirror-model';

import { ZoteroCollection, ZoteroServer, kZoteroBibTeXTranslator, ZoteroCollectionSpec, ZoteroCSL } from '../zotero';

import { ParsedYaml, valueFromYamlText } from '../yaml';
import { suggestCiteId } from '../cite';

import {
  BibliographyDataProvider,
  BibliographyFile,
  BibliographySourceWithCollections,
  BibliographyCollection,
} from './bibliography';
import { EditorUI } from '../ui';
import { CSL } from '../csl';
import { toBibTeX } from './bibDB';
import { Editor } from '../../editor/editor';

export const kZoteroProviderKey = '2509FBBE-5BB0-44C4-B119-6083A81ED673';

export class BibliographyDataProviderZotero implements BibliographyDataProvider {
  private allCollections: ZoteroCollection[] = [];
  private allCollectionSpecs: BibliographyCollection[] = [];
  private server: ZoteroServer;
  private warning: string | undefined;
  private enabled = true;

  private docPath: string | undefined;
  private zoteroConfig: boolean | string[] | undefined;

  public constructor(server: ZoteroServer) {
    this.server = server;
  }

  public name: string = 'Zotero';
  public key: string = kZoteroProviderKey;
  public requiresWritable: boolean = true;

  public async load(
    _ui: EditorUI,
    docPath: string,
    _resourcePath: string,
    yamlBlocks: ParsedYaml[],
    refreshCollectionData: boolean,
  ): Promise<boolean> {
    let hasUpdates = false;
    this.docPath = docPath;
    this.zoteroConfig = zoteroConfig(yamlBlocks);
    if (this.zoteroConfig) {
      // Enabled
      this.enabled = true;
      try {
        // Don't send the items back through to the server
        const collectionSpecs = this.allCollections.map(({ items, ...rest }) => rest);

        // If there is a warning, stop using the cache and force a fresh trip
        // through the whole pipeline to be sure we're trying to clear that warning
        const useCache = this.warning === undefined || this.warning.length === 0;

        // The collection specified in the document header
        const collections = Array.isArray(this.zoteroConfig) ? this.zoteroConfig : [];

        const result = await this.server.getCollections(docPath, collections, collectionSpecs || [], useCache);
        this.warning = result.warning;
        if (result.status === 'ok') {
          if (result.message) {
            const newCollections = (result.message as ZoteroCollection[]).map(collection => {
              const existingCollection = this.allCollections.find(col => col.name === collection.name);
              if (useCache && existingCollection && existingCollection.version === collection.version) {
                collection.items = existingCollection.items;
              } else {
                hasUpdates = true;
              }
              return collection;
            });
            hasUpdates = hasUpdates || newCollections.length !== this.collections.length;
            this.allCollections = newCollections;
          }
        } else {
          // console.log(result.status);
        }
      } catch (err) {
        // console.log(err);
      }

      if (refreshCollectionData) {
        // Lookup the collection specs
        const specResult = await this.server.getActiveCollectionSpecs(
          this.docPath || null,
          Array.isArray(this.zoteroConfig) ? this.zoteroConfig : [],
        );
        if (specResult && specResult.status === 'ok') {
          this.allCollectionSpecs = specResult.message.map((spec: ZoteroCollectionSpec) =>
            this.toBibliographyCollection(spec),
          );
        } else {
          this.allCollectionSpecs = [];
        }
      }
    } else {
      // Zotero is disabled, clear any already loaded bibliography
      if (this.collections.length > 0) {
        hasUpdates = true;
      }
      // Disabled
      this.enabled = false;
      this.allCollections = [];
      this.allCollectionSpecs = [];
    }
    return hasUpdates;
  }

  // Respect enabled;
  public isEnabled(): boolean {
    return this.enabled && (this.allCollections.length > 0 || this.allCollectionSpecs.length > 0);
  }

  public collections(): BibliographyCollection[] {
    return this.allCollectionSpecs || [];
  }

  private toBibliographyCollection(zoteroSpec: ZoteroCollectionSpec) {
    return {
      name: zoteroSpec.name,
      key: zoteroSpec.key,
      parentKey: zoteroSpec.parentKey,
      provider: kZoteroProviderKey,
    };
  }

  public items(): BibliographySourceWithCollections[] {
    const entryArrays = this.allCollections?.map(collection => this.bibliographySources(collection)) || [];
    const zoteroEntries = ([] as BibliographySourceWithCollections[]).concat(...entryArrays);
    return zoteroEntries;
  }

  public itemsForCollection(collectionKey?: string): BibliographySourceWithCollections[] {
    if (!collectionKey) {
      return this.items();
    }

    return this.items().filter((item: any) => {
      if (item.collectionKeys) {
        return item.collectionKeys.includes(collectionKey);
      }
      return false;
    });
  }

  public bibliographyPaths(doc: ProsemirrorNode, ui: EditorUI): BibliographyFile[] {
    return [];
  }

  public async generateBibTeX(ui: EditorUI, id: string, csl: CSL): Promise<string | undefined> {
    if (csl.key && ui.prefs.zoteroUseBetterBibtex()) {
      const bibTeX = await this.server.betterBibtexExport(
        [csl.key],
        kZoteroBibTeXTranslator,
        parseInt((csl as ZoteroCSL).libraryID, 10),
      );
      if (bibTeX) {
        return Promise.resolve(bibTeX.message);
      }
    }
    return Promise.resolve(toBibTeX(id, csl));
  }

  public warningMessage(): string | undefined {
    return this.warning;
  }

  private bibliographySources(collection: ZoteroCollection): BibliographySourceWithCollections[] {
    const items = collection.items?.map(item => {
      return {
        ...item,
        id: item.id || suggestCiteId([], item),
        providerKey: this.key,
        collectionKeys: item.collectionKeys,
      };
    });
    return items || [];
  }
}

// The Zotero header allows the following:
// zotero: true | false                           Globally enables or disables the zotero integration
//                                                If true, uses all collections. If false uses none.
//
// By default, zotero integration is enabled. Add this header to disable integration
//
function zoteroConfig(parsedYamls: ParsedYaml[]): boolean | string[] {
  // Read the values of any yaml blocks that include bibliography headers
  // filter out blocks that don't include such headers
  const zoteroValues = parsedYamls
    .map(parsedYaml => {
      return valueFromYamlText('zotero', parsedYaml.yamlCode);
    })
    .filter(val => val !== null);

  if (zoteroValues.length > 0) {
    // Pandoc will use the last biblography node when generating a bibliography.
    // Take the same approach to the Zotero header and use the last node
    const zoteroConfigValue = zoteroValues[zoteroValues.length - 1];
    if (typeof zoteroConfigValue === 'boolean') {
      return zoteroConfigValue;
    } else if (typeof zoteroConfigValue === 'string') {
      return [zoteroConfigValue];
    } else if (Array.isArray(zoteroConfigValue)) {
      return zoteroConfigValue.map(String);
    } else {
      return true;
    }
  }
  return true;
}
