'use strict';

const jest = require('jest-cli');
const del = require('del');

module.exports = {

  /**
   * @param {module:externals.Gulp} gulp
   * @param {module:main.JestParameters} parameters
   */
  register(gulp, parameters) {
    gulp.task('jest-clean', (done) => {
      del(['coverage'], { force: true }).then(() => {
        done();
      });
    });

    gulp.task('jest', ['jest-clean'], (done) => {
      jest.runCLI(
        {
          config: parameters
        },
        parameters.rootDir,
        success => done(!success)
      );
    });
  }
};
