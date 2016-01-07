'use strict';

const del = require('del');
const webpack = require('webpack');

/**
 * @module tasks/webpack
 */
module.exports = {

  /**
   * @param {external:Gulp} gulp
   * @param {module:tasks/webpack.Parameters} parameters
   */
  register(gulp, parameters) {
    gulp.task('webpack-clean', (done) => {
      del([parameters.output.path], { force: true }).then(() => {
        done();
      });
    });

    gulp.task('webpack', ['webpack-clean'], (done) => {
      webpack(parameters).run((err) => {
        done(err);
      });
    });
  }
};
