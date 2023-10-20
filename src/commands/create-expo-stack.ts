import { GluegunCommand } from 'gluegun'

import {
  configureProjectFiles,
  generateProjectFiles,
  printOutput,
  renderTitle,
  runCLI,
  runIgnite,
  showHelp
} from '../utilities';
import { defaultOptions } from '../constants';
import { CliResults } from '../types';

const command: GluegunCommand = {
  name: 'create-expo-stack',
  description: 'Create a new Expo project',
  run: async (toolbox) => {
    const {
      parameters: { first, options },
      print: { info, highlight, warning },
    } = toolbox;
    if (options.help || options.h) {
      showHelp(info, highlight, warning)

      return;
    }
    try {
      await renderTitle(toolbox);

      // TODO: this is hacky, figure out a way to do this better
      // set timeout for 1 second so that the title can render before the CLI runs
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Set the default options
      let cliResults: CliResults = defaultOptions;

      // Check if user wants to create an opinionated stack prior to running the configurable CLI
      if (options.ignite) {
        await runIgnite(toolbox);
      } else {

        // Conditionally skip running the CLI
        const useDefault = ((options.default !== undefined && options.default) || (options.d !== undefined && options.d));
        const skipCLI = options.nonInteractive;
        const useBlankTypescript = options.blank || false;
        if (!(useDefault || skipCLI || useBlankTypescript)) {
          //  Run the CLI to prompt the user for input
          cliResults = await runCLI(toolbox)
        }

        // @internal Update the cliResults with the options passed in via the command
        // This is used for testing purposes only
        if (options.reactNavigation) {
          // Add react-navigation package
          cliResults.packages.push({
            name: "react-navigation", type: 'navigation', options: {
              navigationType: options.tabs ? "tabs" : "stack"
            }
          });
        }
        if (options.expoRouter) {
          // Add expo-router package
          cliResults.packages.push({
            name: "expo-router", type: 'navigation', options: {
              navigationType: options.tabs ? "tabs" : "stack"
            }
          });
        }
        if (options.nativewind) {
          // Add nativewind package
          cliResults.packages.push({ name: "nativewind", type: 'styling', options: {} });
        }
        if (options.tamagui) {
          // Add tamagui package
          cliResults.packages.push({ name: "tamagui", type: 'styling', options: {} });
        }


        // Destructure the results but set the projectName if the first param is passed in
        if (first) {
          cliResults.projectName = first;
        }

        const { packages } = cliResults;

        // Define props to be passed into the templates

        const navigationPackage = packages.find((p) => p.type === "navigation") || undefined;
        const stylingPackage = packages.find((p) => p.type === "styling")

        let files: string[] = [];

        files = configureProjectFiles(
          files,
          navigationPackage,
          stylingPackage
        );

        // Once all the files are defined, format and generate them
        let formattedFiles: any[] = [];

        formattedFiles = generateProjectFiles(
          cliResults,
          files,
          formattedFiles,
          navigationPackage,
          toolbox,
          stylingPackage
        );

        await printOutput(cliResults, formattedFiles, toolbox);
      }

    } catch (error) {
      // TODO: delete all files

      info(`Oops, something went wrong while creating your project 😢`)
      info('')
      info(`Error: ${error}`)
      info(
        `\nIf this was unexpected, please open an issue: https://github.com/danstepanov/create-expo-stack#reporting-bugs--feedback`
      )
    }
  },
}

export default command;
