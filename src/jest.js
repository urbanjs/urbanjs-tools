'use strict';

const jest = require('jest-cli');
const del = require('del');

/**
 * @module tasks/jest
 */
module.exports = {

  /**
   * @function
   * @param {external.Gulp} gulp
   * @param {module:tasks/jest.Parameters} parameters
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
