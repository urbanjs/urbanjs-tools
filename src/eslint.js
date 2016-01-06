'use strict';

const eslint = require('gulp-eslint');

module.exports = {

  /**
   * @param {module:externals.Gulp} gulp
   * @param {module:main.ESLintParameters} parameters
   */
  register(gulp, parameters) {
    gulp.task('eslint', () => {
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
