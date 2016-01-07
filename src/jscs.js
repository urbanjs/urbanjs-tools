'use strict';

const jscs = require('gulp-jscs');

/**
 * @module tasks/jscs
 */
module.exports = {

  /**
   * @function
   * @param {external:Gulp} gulp
   * @param {module:tasks/jscs.Parameters} parameters
   */
  register(gulp, parameters) {
    gulp.task('jscs', () => {
      return gulp.src(parameters.files)
        .pipe(jscs({
          configPath: parameters.configFile,
          esnext: parameters.esnext
        }));
    });
  }
};
