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
   * @param {string} taskName
   * @param {module:tasks/jest.Parameters} parameters
   */
  register(gulp, taskName, parameters) {
    const cleanUpTaskName = taskName + '-clean';
    gulp.task(cleanUpTaskName, (done) => {
      del(['coverage'], { force: true }).then(() => {
        done();
      });
    });

    gulp.task(taskName, [cleanUpTaskName], (done) => {
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
