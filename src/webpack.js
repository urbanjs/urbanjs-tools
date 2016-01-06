'use strict';

const del = require('del');
const webpack = require('webpack');

module.exports = {

  /**
   * @param {module:externals.Gulp} gulp
   * @param {module:main.DistParameters} parameters
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
