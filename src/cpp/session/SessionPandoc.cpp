/*
 * SessionPanmirrorPandoc.cpp
 *
 * Copyright (C) 2009-16 by RStudio, Inc.
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



#include <shared_core/Error.hpp>

#include <core/StringUtils.hpp>

#include <core/system/Process.hpp>

#include <r/ROptions.hpp>

#include <session/SessionModuleContext.hpp>

using namespace rstudio::core;

namespace rstudio {
namespace session {
namespace module_context {

namespace {

std::string pandocBinary(const std::string& binary)
{
#ifndef WIN32
   std::string target = binary;
#else
   std::string target = binary + ".exe";
#endif
  FilePath pandocPath = session::options().pandocPath().completeChildPath(target);
  return string_utils::utf8ToSystem(pandocPath.getAbsolutePath());
}

core::system::ProcessOptions pandocOptions()
{
   core::system::ProcessOptions options;
#ifdef _WIN32
   options.createNewConsole = true;
#else
   options.terminateChildren = true;
#endif
   return options;
}

Error runAsync(const std::string& executablePath,
               const std::vector<std::string>& args,
               const std::string&input,
               const boost::function<void(const core::system::ProcessResult&)>& onCompleted)
{
   return module_context::processSupervisor().runProgram(
      executablePath,
      args,
      input,
      pandocOptions(),
      onCompleted
   );
}

std::vector<std::string> prependStackSize(const std::vector<std::string>& args)
{
   std::string size = r::options::getOption<std::string>("pandoc.editor.stack.size", "128m", false);
   std::vector<std::string> newArgs = { "+RTS", "-K" + size, "-RTS" };
   std::copy(args.begin(), args.end(), std::back_inserter(newArgs));
   return newArgs;
}


} // anonymous namespace

std::string pandocPath()
{
   return pandocBinary("pandoc");
}

Error runPandoc(const std::vector<std::string>& args, const std::string& input, core::system::ProcessResult* pResult)
{
   return core::system::runProgram(
      pandocPath(),
      prependStackSize(args),
      input,
      pandocOptions(),
      pResult
   );
}

Error runPandocAsync(const std::vector<std::string>& args,
                     const std::string&input,
                     const boost::function<void(const core::system::ProcessResult&)>& onCompleted)
{
   return runAsync(pandocPath(), prependStackSize(args), input, onCompleted);
}


} // end namespace module_context
} // end namespace session
} // end namespace rstudio
