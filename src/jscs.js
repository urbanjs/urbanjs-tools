'use strict';

const jscs = require('gulp-jscs');

/**
 * @module tasks/jscs
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for validating the code style of JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jscs.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jscs',
   *   {
   *     configFile: require('path').join(__dirname + '.jscsrc'),
   *     files: require('path').join(__dirname, 'src/*.js')
   *   }
   * );
   */
  register(gulp, taskName, parameters) {
    gulp.task(taskName, () => {
      return gulp.src(parameters.files)
        .pipe(jscs({ configPath: parameters.configFile }))
        .pipe(jscs.reporter());
    });
  }
};
