'use strict';

const eslint = require('gulp-eslint');

/**
 * @module tasks/eslint
 */
module.exports = {

  /**
   * @function
   * @param {external:Gulp} gulp
   * @param {module:tasks/eslint.Parameters} parameters
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
