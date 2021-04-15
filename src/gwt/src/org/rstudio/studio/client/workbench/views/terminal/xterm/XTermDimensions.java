/*
 * XTermDimensions.java
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

package org.rstudio.studio.client.workbench.views.terminal.xterm;

import jsinterop.annotations.JsPackage;
import jsinterop.annotations.JsProperty;
import jsinterop.annotations.JsType;

/**
 * Size of xterm in rows and columns of text.
 * https://github.com/xtermjs/xterm.js/blob/4.7.0/addons/xterm-addon-fit/typings/xterm-addon-fit.d.ts
 */
@JsType(isNative = true, namespace = JsPackage.GLOBAL, name = "Object")
public class XTermDimensions
{
   @JsProperty public native int getCols();
   @JsProperty public native int getRows();
}
