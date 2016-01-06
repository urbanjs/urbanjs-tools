'use strict';

const jscs = require('gulp-jscs');

module.exports = {

  /**
   * @param {module:externals.Gulp} gulp
   * @param {module:main.JSCSParameters} parameters
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
