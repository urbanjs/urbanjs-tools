'use strict';

const generate = require('./generate');
const pkg = require('../../package.json');

module.exports = {

  /**
   * Main entry point of the cli, runs the proper command or shows the help.
   * @param {string[]} args Array of the arguments
   * @param {Object} yargs Yargs instance to use
   * @private
   */
  run(args, yargs) {
    let commandFound = false;
    const runCommand = (y, command) => {
      commandFound = true;
      command.run(args, y);
    };

    yargs
      .help('h')
      .alias('h', 'help')
      .showHelpOnFail(false, 'Specify --help for available options')
      .version(pkg.version)
      .alias('v', 'version')
      .strict()
      .command(
        'generate',
        'Generates a skeleton for your next project',
        y => runCommand(y, generate)
      )
      .usage('Usage: urbanjs <command>')
      .parse(args);

    if (!commandFound) {
      yargs.showHelp();
    }
  }
};
