'use strict';

const shell = require('gulp-shell');
const globals = require('./index-globals');

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
    gulp.task(taskName, shell.task([
      `"${parameters.executablePath}retire" ${parameters.options || ''}`
    ], { env: { urbanJSToolGlobals: JSON.stringify(globals) } }));
  }
};
