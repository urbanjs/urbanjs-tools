'use strict';

const checkFileNamingConvention = require('gulp-check-file-naming-convention');
const mergeStream = require('event-stream').merge;

/**
 * @module tasks/checkFileNames
 */
module.exports = {

  /**
   * @function
   * @param {external:Gulp} gulp
   * @param {string} taskName
   * @param {module:tasks/checkFileNames.Parameters} parameters
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
