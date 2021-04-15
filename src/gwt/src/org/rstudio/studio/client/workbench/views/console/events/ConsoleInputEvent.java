/*
 * ConsoleInputEvent.java
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
package org.rstudio.studio.client.workbench.views.console.events;

import com.google.gwt.event.shared.EventHandler;
import com.google.gwt.event.shared.GwtEvent;

public class ConsoleInputEvent extends GwtEvent<ConsoleInputEvent.Handler>
{
   public static final int FLAG_CANCEL = 1;
   public static final int FLAG_EOF    = 2;
   
   public ConsoleInputEvent(String input,
                            String console,
                            int flags)
   {
      input_ = input;
      console_ = console;
      flags_ = flags;
   }
   
   public ConsoleInputEvent(String input,
                            String console)
   {
      input_ = input;
      console_ = console;
      flags_ = 0;
   }
   
   public ConsoleInputEvent(int flags)
   {
      this("", "", flags);
   }
   
   public String getInput()
   {
      return input_;
   }
   
   public String getConsole()
   {
      return console_;
   }
   
   public int getFlags()
   {
      return flags_;
   }
   
   private final String input_;
   private final String console_;
   private final int flags_;
   
   @Override
   protected void dispatch(Handler handler)
   {
      handler.onConsoleInput(this);
   }

   @Override
   public Type<Handler> getAssociatedType()
   {
      return TYPE;
   }
   
   public interface Handler extends EventHandler
   {
      void onConsoleInput(ConsoleInputEvent event);
   }

   public static final Type<Handler> TYPE = new Type<>();

}
