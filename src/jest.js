'use strict';

const jest = require('jest-cli');
const del = require('del');

/**
 * @module tasks/jest
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for running the jest unit tests.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jest.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jest',
   *   { rootDir: require('path').join(__dirname + 'src') }
   * );
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
        { config: parameters },
        parameters.rootDir,
        success => done(!success)
      );
    });
  }
};
