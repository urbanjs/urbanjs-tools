'use strict';

const generate = require('./generate');
const pkg = require('../../package.json');

/**
 * @module cli/index
 */
module.exports = {

  /**
   * Main entry point of the cli, runs the proper command or shows the help.
   * @example
   * Commands:
   *  generate        - Builds the skeleton of the project
   *
   * Options:
   *  -h or --help    - Shows the manual
   *  -v or --version - Shows the current version
   *
   * run(['generate', '-n', 'your-awesome-project', '-f']);
   *
   * @param {string[]} args Array of the arguments
   * @param {Object} [yargs] Yargs instance to use
   */
  run(args, yargs) {
    yargs = yargs || require('yargs'); // eslint-disable-line no-param-reassign

    let commandExecution = null;
    const runCommand = (y, command) => {
      commandExecution = command.run(args, y);
    };

    yargs
      .exitProcess(false)
      .showHelpOnFail(false)
      .help('h')
      .alias('h', 'help')
      .version(pkg.version)
      .alias('v', 'version')
      .strict()
      .usage('Usage: urbanjs <command>')
      .command(
        'generate',
        'Generates a skeleton for your next project',
        y => runCommand(y, generate)
      );

    let argv;
    try {
      argv = yargs.parse(args);
    } catch (err) {
      // the command is responsible for showing help if an execution has been started
      if (!commandExecution) {
        // most of the time an unknown option causes this error
        // let's show the help how to use urbanjs correctly
        yargs.showHelp();
      }

      return Promise.reject(err);
    }

    if (argv.v || argv.h) {
      // yargs handles these options synchronously
      return Promise.resolve();
    } else if (commandExecution) {
      // return the promise of the command
      return commandExecution;
    }

    yargs.showHelp();
    return Promise.reject(new Error('Invalid argument'));
  }
};
