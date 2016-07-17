'use strict';

const _ = require('lodash');
const npmInstall = require('../npm-install');
const pkg = require('../../../package.json');
const shell = require('gulp-shell');
const configHelper = require('../../utils/helper-config');

function buildConfig(parameters, processOptionPrefix) {
  const defaults = require('./defaults');

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

/**
 * @module tasks/retire
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'retire'
  ]),

  /**
   * @function
   * @description This task is responsible for validating the used packages against vulnerabilities.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/retire.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'retire',
   *   { packagePath: require.resolve('retire') }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    gulp.task(taskName, [installDependenciesTaskName], done => {
      const config = buildConfig(parameters, taskName);

      shell.task([
        `node "${config.packagePath}bin/retire" ${config.options || ''}`
      ])(done);
    });
  }
};
