/*
 * react.ts
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

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { EditorView } from 'prosemirror-view';

export interface WidgetProps {
  classes?: string[];
  style?: React.CSSProperties;
}

// Render a react element into a DOM container that will eventually be added to the EditorView.dom
// this function is necessary for situations where an element is created and then handed to ProseMirror
// (unattached to the DOM), and then subsequently destoyed/unmounted by ProseMirror. We use a
// MutationObserver to watch EditorView.dom for the element's removal then in response call
// ReactDOM.unmountComponentAtNode
export function reactRenderForEditorView(element: React.ReactElement, container: HTMLElement, view: EditorView) {
  // render the react element into the container
  const ref = ReactDOM.render(element, container);

  // track view dom mutations to determine when ProseMirror has destroyed the element
  // (our cue to unmount/cleanup the react component)
  const observer = new MutationObserver(mutationsList => {
    mutationsList.forEach(mutation => {
      mutation.removedNodes.forEach(node => {
        if (node === container) {
          observer.disconnect();
          ReactDOM.unmountComponentAtNode(container);
        }
      });
    });
  });
  observer.observe(view.dom, { attributes: false, childList: true, subtree: true });

  // return the ref
  return ref;
}
