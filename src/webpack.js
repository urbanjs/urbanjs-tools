'use strict';

const del = require('del');
const webpack = require('webpack');

/**
 * @module tasks/webpack
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for building the project.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/webpack.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'webpack',
   *   {
   *     watch: false,
   *     config: require('path').join(__dirname, 'webpack.config.js')
   *   }
   * );
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

      if (parameters.watch) {
        let counter = 0;
        bundler.watch(200, err => {
          if (++counter === (parameters.config.length || 1)) {
            done(err);
          }
        });
      } else {
        bundler.run(err => done(err));
      }
    });
  }
};
