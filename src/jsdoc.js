'use strict';

const shell = require('gulp-shell');
const del = require('del');

/**
 * @module tasks/jsdoc
 */
module.exports = {

  /**
   * @param {external:Gulp} gulp
   * @param {module:tasks/jsdoc.Parameters} parameters
   */
  register(gulp, parameters) {
    const command = `${parameters.executablePath}jsdoc -c ${parameters.configFile}`;

    gulp.task('jsdoc-clean', (done) => {
      del(['help'], { force: true }).then(() => {
        done();
      });
    });

    gulp.task('jsdoc', ['jsdoc-clean'], shell.task([command]));
  }
};
