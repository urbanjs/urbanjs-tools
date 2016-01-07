'use strict';

const jscs = require('gulp-jscs');

/**
 * @module tasks/jscs
 */
module.exports = {

  /**
   * @function
   * @param {external:Gulp} gulp
   * @param {string} taskName
   * @param {module:tasks/jscs.Parameters} parameters
   */
  register(gulp, taskName, parameters) {
    gulp.task(taskName, () => {
      return gulp.src(parameters.files)
        .pipe(jscs({
          configPath: parameters.configFile,
          esnext: parameters.esnext
        }));
    });
  }
};
