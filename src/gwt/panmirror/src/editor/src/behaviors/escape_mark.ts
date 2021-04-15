/*
 * escape_mark.ts
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

import { EditorState, Transaction } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';

import { BaseKey } from '../api/basekeys';
import { Extension } from '../api/extension';

const extension: Extension = {
  baseKeys: (_schema: Schema) => {
    return [
      {
        key: BaseKey.ArrowRight,
        command: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          if (state.selection.empty) {
            // if we are at the end of a parent text block and there are
            // marks stored in the state or active on the selection then
            // clear the stored marks and insert a space.
            const $head = state.selection.$head;
            const parent = $head.node($head.depth);
            if (
              parent.type.isTextblock &&
              $head.parentOffset === parent.textContent.length &&
              ($head.marks().length > 0 || !!state.storedMarks)
            ) {
              if (dispatch) {
                const tr = state.tr;
                tr.setStoredMarks([]);
                tr.insertText(' ');
                dispatch(tr);
              }
              return true;
            }
          }
          return false;
        },
      },
    ];
  },
};

export default extension;
