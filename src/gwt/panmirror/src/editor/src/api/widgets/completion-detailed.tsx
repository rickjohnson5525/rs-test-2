/*
 * completion-detailed.tsx
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

import React from 'react';

import { WidgetProps } from './react';

import './completion-detailed.css';

export interface CompletionItemDetailedViewProps extends WidgetProps {
  width: number;
  image?: string;
  heading: string;
  title: string;
  subTitle: string;
}

export const CompletionItemDetailedView: React.FC<CompletionItemDetailedViewProps> = props => {
  const className = ['pm-completion-detailed-item'].concat(props.classes || []).join(' ');
  const style: React.CSSProperties = {
    width: props.width + 'px',
    ...props.style,
  };

  return (
    <div className={className} style={style}>
      <div className={'pm-completion-detailed-item-type'}>
        <img className={'pm-block-border-color'} src={props.image} />
      </div>
      <div className={'pm-completion-item-detailed-summary'}>
        <div className={'pm-completion-item-detailed-heading'}>{props.heading}</div>
        <div className={'pm-completion-item-detailed-title'}>{props.title}</div>
        <div className={'pm-completion-item-detailed-subTitle'}>{props.subTitle}</div>
      </div>
    </div>
  );
};
