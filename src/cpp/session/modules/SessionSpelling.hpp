/*
 * SessionSpelling.hpp
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

#ifndef SESSION_SPELLING_HPP
#define SESSION_SPELLING_HPP

#include <shared_core/json/Json.hpp>

namespace rstudio {
namespace core {
   class Error;
   class FilePath;
}
}
 
namespace rstudio {
namespace session {
namespace modules { 
namespace spelling {

core::FilePath userDictionariesDir();
core::FilePath legacyAllLanguagesDir();
core::FilePath allDictionariesDir();
core::FilePath allLanguagesDir();
core::FilePath customDictionariesDir();

core::json::Object spellingPrefsContextAsJson();

core::Error initialize();
                       
} // namespace spelling
} // namespace modules
} // namespace session
} // namespace rstudio

#endif // SESSION_SPELLING_HPP
