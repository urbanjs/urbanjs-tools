'use strict';

module.exports = {
  /**
   * Initializes the given yargs with common settings
   * @param {Object} [yargs] Yargs instance to use
   * @return {Object}
   */
  initYargs(yargs) {
    yargs = yargs || require('yargs'); // eslint-disable-line no-param-reassign

    yargs
      .exitProcess(false)
      .showHelpOnFail(false)
      .help('h')
      .alias('h', 'help')
      .strict();

    let counter = 0;
    const baseShowHelp = yargs.showHelp;
    yargs.showHelp = function showHelp() { // eslint-disable-line no-param-reassign
      return ++counter === 1
        ? baseShowHelp.apply(yargs, arguments) // eslint-disable-line prefer-rest-params
        : yargs;
    };

    return yargs;
  },

  /**
   * Parses the given arguments
   * @param {Object} yargs Yargs instance to use
   * @param {string[]} args
   * @return {Object}
   */
  parseArgs(yargs, args) {
    try {
      const argv = yargs.parse(args);

      return argv.h
        ? Promise.reject(new Error('Help'))
        : Promise.resolve(argv);
    } catch (err) {
      // most of the time an unknown option causes this error
      // let's show the help how to use it correctly
      yargs.showHelp();

      return Promise.reject(err);
    }
  }
};
