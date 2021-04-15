/*
 * MemoryUsageSummaryDialog.java
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
package org.rstudio.studio.client.workbench.views.environment.view;

import com.google.gwt.aria.client.Roles;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.Widget;
import org.rstudio.core.client.widget.ModalDialogBase;
import org.rstudio.core.client.widget.ThemedButton;
import org.rstudio.studio.client.workbench.views.environment.model.MemoryUsageReport;

public class MemoryUsageSummaryDialog extends ModalDialogBase
{
   public MemoryUsageSummaryDialog(MemoryUsageReport report)
   {
      super(Roles.getDialogRole());
      summary_ = new MemoryUsageSummary(report);
      setText("Memory Usage Report (" + report.getSystemUsage().getPercentUsed() + "% in use)");
      addOkButton(new ThemedButton("OK", new ClickHandler()
      {
         @Override
         public void onClick(ClickEvent event)
         {
            closeDialog();
         }
      }));
   }

   @Override
   protected Widget createMainWidget()
   {
      return summary_;
   }

   MemoryUsageSummary summary_;
}
