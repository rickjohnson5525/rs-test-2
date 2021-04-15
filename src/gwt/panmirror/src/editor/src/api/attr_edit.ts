/*
 * node_attr.tsx
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

import { Node as ProsemirrorNode, NodeType, Schema } from 'prosemirror-model';

import { CommandFn } from './command';

export interface AttrEditOptions {
  type: (schema: Schema) => NodeType;
  tags?: (node: ProsemirrorNode) => string[];
  editFn?: () => CommandFn;
  noDecorator?: boolean;
  offset?: {
    top: number;
    right: number;
  };
}
