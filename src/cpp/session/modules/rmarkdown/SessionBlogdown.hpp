/*
 * SessionBlogdown.hpp
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
#ifndef SESSION_SESSION_BLOGDOWN_HPP
#define SESSION_SESSION_BLOGDOWN_HPP

namespace rstudio {
   namespace core {
      namespace json {
         class Object;
      }
   }
}

namespace rstudio {
namespace session {
namespace modules {
namespace rmarkdown {
namespace blogdown {

bool isHugoProject();

core::json::Object blogdownConfig(bool refresh = true);

} // namespace blogdown
} // namespace rmarkdown
} // namespace modules
} // namespace session
} // namespace rstudio

#endif // SESSION_SESSION_BLOGDOWN_HPP
