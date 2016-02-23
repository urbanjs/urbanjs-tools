'use strict';

const yargsHelper = require('../lib/helper-yargs');
const npmInstall = require('../npm-install');
const _ = require('lodash');

/**
 * @module cli/install-dependencies
 */
module.exports = {

  /**
   * Installs the dependencies of the given tasks.
   * @example
   * Options:
   *  -t or --tasks   - Name of the tasks
   *  -g or --global  - Whether to install dependencies globally
   *  -l or --link    - Whether to allow linking the globally installed, suitable packages
   *  -v or --verbose - Whether to log additional details during the installation
   *  -h or --help    - Shows the manual
   *
   * run(['-t', 'jscs eslint jsdoc']);
   *
   * @param {string[]} args Array of the arguments
   * @param {Object} [yargs] Yargs instance to use
   */
  run(args, yargs) {
    yargs = yargsHelper.initYargs(yargs) // eslint-disable-line no-param-reassign
      .options({
        t: {
          alias: 'tasks',
          type: 'array',
          demand: true,
          description: 'The name of the tasks'
        },
        g: {
          alias: 'global',
          type: 'boolean',
          description: 'Whether to install dependencies globally'
        },
        l: {
          alias: 'link',
          type: 'boolean',
          description: 'Whether to allow linking globally installed, suitable packages'
        },
        v: {
          alias: 'verbose',
          type: 'boolean',
          description: 'Whether to log additional details during the installation'
        }
      })
      .usage('Usage: urbanjs install-dependencies -t jscs eslint jsdoc');

    return yargsHelper.parseArgs(yargs, args)
      .then(argv => Promise.all(
        argv.tasks.map(taskName => {
          try {
            return npmInstall.install(
              require(`../${taskName}`).dependencies,
              _.pick(argv, ['verbose', 'global', 'link'])
            );
          } catch (err) {
            return Promise.reject(new Error(`Unknown task: ${taskName}`));
          }
        })
      ))
      .then(() => {
        console.log(// eslint-disable-line no-console
          'Dependencies have been installed successfully');
      })
      .catch(err => {
        console.error(// eslint-disable-line no-console
          'Dependencies cannot be installed:',
          err
        );

        throw err;
      });
  }
};
