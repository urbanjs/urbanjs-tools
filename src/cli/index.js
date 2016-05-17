'use strict';

const generate = require('./generate');
const installDependencies = require('./install-dependencies');
const pkg = require('../../package.json');
const yargsHelper = require('../utils/helper-yargs');

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
    yargs = yargsHelper.initYargs(yargs) // eslint-disable-line no-param-reassign
      .version(pkg.version)
      .alias('v', 'version')
      .usage('Usage: urbanjs <command>');

    let commandExecution = null;
    [
      [generate, 'generate', 'Generates a skeleton for your next project'],
      [installDependencies, 'install-dependencies', 'Installs the dependencies of the given tasks']
    ].forEach(command => yargs.command(command[1], command[2], y => {
      if (args[0] !== command[1]) {
        console.log(// eslint-disable-line no-console
          `Invalid argument: ${args.join(' ')}`);

        throw new Error('Invalid argument');
      }

      commandExecution = command[0].run(args.slice(1), y);
    }));

    return yargsHelper.parseArgs(yargs, args).then(argv => {
      if (argv.v) {
        // yargs handles this option synchronously
        return Promise.resolve();
      } else if (commandExecution) {
        // return the promise of the command
        return commandExecution;
      }

      yargs.showHelp();
      return Promise.reject(new Error('Invalid argument'));
    });
  }
};
