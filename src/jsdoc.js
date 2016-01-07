'use strict';

const shell = require('gulp-shell');
const del = require('del');

/**
 * @module tasks/jsdoc
 */
module.exports = {

  /**
   * @param {external:Gulp} gulp
   * @param {string} taskName
   * @param {module:tasks/jsdoc.Parameters} parameters
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
