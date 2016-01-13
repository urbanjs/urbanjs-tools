'use strict';

const eslint = require('gulp-eslint');

/**
 * @module tasks/eslint
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for linting JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/eslint.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'eslint',
   *   {
    *     configFile: require('path').join(__dirname + '.eslintrc'),
    *     files: require('path').join(__dirname, 'src/*.js')
    *   }
   * );
   */
  register(gulp, taskName, parameters) {
    gulp.task(taskName, () => {
      return gulp.src(parameters.files)
        .pipe(eslint({
          configFile: parameters.configFile,
          envs: parameters.envs || {},
          globals: parameters.globals || {}
        }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
    });
  }
};
