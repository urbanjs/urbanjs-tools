'use strict';

const checkFileNamingConvention = require('gulp-check-file-naming-convention');
const mergeStream = require('event-stream').merge;

/**
 * @module tasks/checkFileNames
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for validating the project files
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/checkFileNames.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'check-file-names',
   *   { paramCase: require('path').join(__dirname, 'src/*.js') }
   * );
   */
  register(gulp, taskName, parameters) {
    gulp.task(taskName, () => {
      return mergeStream(
        Object.keys(parameters).map(caseName => {
          return gulp.src(parameters[caseName])
            .pipe(checkFileNamingConvention({ caseName }));
        })
      );
    });
  }
};
