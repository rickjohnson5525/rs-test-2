/*
 * MemoryStat.java
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
package org.rstudio.studio.client.workbench.views.environment.model;

import com.google.gwt.core.client.JavaScriptObject;

public class MemoryUsage extends JavaScriptObject
{
   protected MemoryUsage() {}

   public final native MemoryStat getTotal() /*-{
      return this.total;
   }-*/;

   public final native MemoryStat getUsed() /*-{
      return this.used;
   }-*/;

   public final native MemoryStat getProcess() /*-{
      return this.process;
   }-*/;

   /**
    * Compute the percentage of memory used.
    *
    * @return The amount of memory used as a percentage of the total.
    */
   public final int getPercentUsed()
   {
      return (int)Math.round(((getUsed().getKb() * 1.0) / (getTotal().getKb() * 1.0)) * 100);
   }

   /**
    * Compute the percentage of process memory used.
    *
    * @return The amount of memory used as a percentage of the total.
    */
   public final int getProcessPercentUsed()
   {
      return (int)Math.round(((getProcess().getKb() * 1.0) / (getTotal().getKb() * 1.0)) * 100);
   }
}
