/*
 * ServerEnvVars.hpp
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

#ifndef SERVER_ENV_VARS_HPP
#define SERVER_ENV_VARS_HPP

#include <core/system/Types.hpp>

namespace rstudio {
namespace core {
   class Error;
}
}

namespace rstudio {
namespace server {
namespace env_vars {

core::Error initialize();

void forwardHttpProxyVars(core::system::Options *pEnvironment);

} // namespace env_vars
} // namespace server
} // namespace rstudio

#endif // SERVER_ENV_VARS_HPP
