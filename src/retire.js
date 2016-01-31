'use strict';

const _ = require('lodash');
const npmInstall = require('./npm-install');
const pkg = require('../package.json');
const shell = require('gulp-shell');
const utils = require('./lib/utils');

function buildConfig(parameters) {
  const defaults = require('./retire-defaults');

  return utils.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/retire
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for validating the used packages against vulnerabilities.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/retire.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'retire',
   *   { executablePath: path.join(__dirname, 'node_modules/.bin/') }
   * );
   */
  register(gulp, taskName, parameters) {
    const installDependenciesTaskName = taskName + '-install-dependencies';
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: _.pick(pkg.devDependencies, [
        'retire'
      ])
    });

    gulp.task(taskName, [installDependenciesTaskName], done => {
      const config = buildConfig(parameters);

      shell.task([
        `"${config.executablePath}retire" ${config.options || ''}`
      ])(done);
    });
  }
};
