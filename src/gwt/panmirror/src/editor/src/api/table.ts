/*
 * table.ts
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

import { EditorCommandId } from './command';
import { EditorUI } from './ui';

export interface TableCapabilities {
  captions: boolean;
  headerOptional: boolean;
  multiline: boolean;
}

export function tableMenu(insert: boolean, ui: EditorUI) {
  return [
    ...(insert ? [{ command: EditorCommandId.TableInsertTable }] : []),
    { command: EditorCommandId.TableAddRowBefore },
    { command: EditorCommandId.TableAddRowAfter },
    { separator: true },
    { command: EditorCommandId.TableAddColumnBefore },
    { command: EditorCommandId.TableAddColumnAfter },
    { separator: true },
    { command: EditorCommandId.TableDeleteRow },
    { command: EditorCommandId.TableDeleteColumn },
    { separator: true },
    { command: EditorCommandId.TableDeleteTable },
    { separator: true },
    {
      text: ui.context.translateText('Align Column'),
      subMenu: {
        items: [
          { command: EditorCommandId.TableAlignColumnLeft },
          { command: EditorCommandId.TableAlignColumnCenter },
          { command: EditorCommandId.TableAlignColumnRight },
          { separator: true },
          { command: EditorCommandId.TableAlignColumnDefault },
        ],
      },
    },
    { separator: true },
    { command: EditorCommandId.TableToggleHeader },
    { command: EditorCommandId.TableToggleCaption },
  ];
}
