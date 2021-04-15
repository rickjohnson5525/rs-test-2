/*
 * list-commands.ts
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

import { NodeType, Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { autoJoin } from 'prosemirror-commands';
import { NodeWithPos, findParentNode } from 'prosemirror-utils';

import { NodeCommand, toggleList, ProsemirrorCommand, EditorCommandId } from '../../api/command';
import { EditorUI, EditorUIPrefs } from '../../api/ui';
import { ListProps } from '../../api/ui-dialogs';
import { ListType, ListCapabilities, isList } from '../../api/list';
import { OmniInsert } from '../../api/omni_insert';

export class ListCommand extends NodeCommand {
  constructor(
    id: EditorCommandId,
    keymap: string[],
    listType: NodeType,
    listItemType: NodeType,
    omniInsert: OmniInsert,
    prefs: EditorUIPrefs,
  ) {
    super(id, keymap, listType, {}, autoJoin(toggleList(listType, listItemType, prefs), [listType.name]), omniInsert);
  }
}

export class TightListCommand extends ProsemirrorCommand {
  constructor() {
    super(
      EditorCommandId.TightList,
      ['Mod-Alt-9'],
      (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => {
        const parentList = findParentNode(isList)(state.selection);
        if (!parentList) {
          return false;
        }

        if (dispatch) {
          const tr = state.tr;
          const node = parentList.node;
          tr.setNodeMarkup(parentList.pos, node.type, {
            ...node.attrs,
            tight: !node.attrs.tight,
          });
          dispatch(tr);
        }

        return true;
      },
    );
  }

  public isActive(state: EditorState): boolean {
    if (this.isEnabled(state)) {
      const itemNode = findParentNode(isList)(state.selection) as NodeWithPos;
      return itemNode.node.attrs.tight;
    } else {
      return false;
    }
  }
}

export function editListPropertiesCommandFn(ui: EditorUI, capabilities: ListCapabilities) {
  return (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => {
    // see if a parent node is a list
    let node: ProsemirrorNode | null = null;
    let pos: number = 0;
    const nodeWithPos = findParentNode(isList)(state.selection);
    if (nodeWithPos) {
      node = nodeWithPos.node;
      pos = nodeWithPos.pos;
    }

    // return false (disabled) for no targets
    if (!node) {
      return false;
    }

    // execute command when requested
    async function asyncEditList() {
      if (dispatch) {
        await editList(node as ProsemirrorNode, pos, state, dispatch, ui, capabilities);
        if (view) {
          view.focus();
        }
      }
    }
    asyncEditList();

    return true;
  };
}

export class EditListPropertiesCommand extends ProsemirrorCommand {
  constructor(ui: EditorUI, capabilities: ListCapabilities) {
    super(EditorCommandId.EditListProperties, [], editListPropertiesCommandFn(ui, capabilities));
  }
}

async function editList(
  node: ProsemirrorNode,
  pos: number,
  state: EditorState,
  dispatch: (tr: Transaction<any>) => void,
  ui: EditorUI,
  capabilities: ListCapabilities,
): Promise<void> {
  // get list properties
  const schema = node.type.schema;
  const attrs = node.attrs;
  const props = {
    ...attrs,
    type: node.type === schema.nodes.ordered_list ? ListType.Ordered : ListType.Bullet,
  } as ListProps;

  // edit list
  const result = await ui.dialogs.editList(props, capabilities);

  // apply result
  if (result) {
    const tr = state.tr;
    const listType = result.type === ListType.Ordered ? schema.nodes.ordered_list : schema.nodes.bullet_list;
    tr.setNodeMarkup(pos, listType, {
      ...attrs,
      ...result,
    });
    dispatch(tr);
  }
}
