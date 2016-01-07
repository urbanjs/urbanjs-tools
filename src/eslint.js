'use strict';

const eslint = require('gulp-eslint');

/**
 * @module tasks/eslint
 */
module.exports = {

  /**
   * @function
   * @param {external:Gulp} gulp
   * @param {string} taskName
   * @param {module:tasks/eslint.Parameters} parameters
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
