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
      Promise.all([].concat(parameters.config).map(webpackConfig => {
        return del([webpackConfig.output.path], { force: true });
      })).then(() => done()).catch(e => done(e));
    });

    gulp.task(taskName, [cleanUpTaskName], (done) => {
      const bundler = webpack(parameters.config);
      const cb = (err/*, stats*/) => {
        //console.log(stats.toString(parameters.config.stats || {})); //eslint-disable-line no-console

        done(err);
      };

      if (parameters.watch) {
        bundler.watch(200, cb);
      } else {
        bundler.run(cb);
      }
    });
  }
};
