'use strict';

const del = require('del');
const webpack = require('webpack');

/**
 * @module tasks/webpack
 */
module.exports = {

  /**
   * @param {external:Gulp} gulp
   * @param {string} taskName
   * @param {module:tasks/webpack.Parameters} parameters
   */
  register(gulp, taskName, parameters) {
    const cleanUpTaskName = taskName + '-clean';
    gulp.task(cleanUpTaskName, (done) => {
      del([parameters.output.path], { force: true }).then(() => {
        done();
      });
    });

    gulp.task(taskName, [cleanUpTaskName], (done) => {
      webpack(parameters).run((err) => {
        done(err);
      });
    });
  }
};
