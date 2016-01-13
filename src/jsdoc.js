'use strict';

const shell = require('gulp-shell');
const del = require('del');

/**
 * @module tasks/jsdoc
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for generating the API documentation.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jsdoc.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jsdoc',
   *   {
   *     configFile: require('path').join(__dirname + '.jsdocrc'),
   *     executablePath: path.join(__dirname, 'node_modules/.bin/')
   *   }
   * );
   */
  register(gulp, taskName, parameters) {
    const cleanUpTaskName = taskName + '-clean';
    gulp.task(cleanUpTaskName, (done) => {
      del(['help'], { force: true }).then(() => {
        done();
      });
    });

    gulp.task(taskName, [cleanUpTaskName], shell.task([
      `${parameters.executablePath}jsdoc -c ${parameters.configFile}`
    ]));
  }
};
