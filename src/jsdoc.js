'use strict';

const shell = require('gulp-shell');
const del = require('del');

module.exports = {

  /**
   * @param {module:externals.Gulp} gulp
   * @param {module:main.JSDocParameters} parameters
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
