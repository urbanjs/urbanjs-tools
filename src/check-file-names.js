'use strict';

const checkFileNamingConvention = require('gulp-check-file-naming-convention');
const mergeStream = require('event-stream').merge;

module.exports = {
  /**
   * @param {module:externals.Gulp} gulp
   * @param {module:main.CheckFileNamesParameters} parameters
   */
  register(gulp, parameters) {
    gulp.task('check-file-names', () => {
      return mergeStream(
        Object.keys(parameters).map(caseName => {
          return gulp.src(parameters[caseName])
            .pipe(checkFileNamingConvention({ caseName }));
        })
      );
    });
  }
};
