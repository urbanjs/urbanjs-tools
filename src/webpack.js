'use strict';

const _ = require('lodash');
const del = require('del');
const npmInstall = require('./npm-install');
const pkg = require('../package.json');
const utils = require('./lib/utils');

function buildConfig(parameters, globals) {
  const defaults = require('./webpack-defaults');

  if (globals && globals.babel) {
    defaults.config.module.loaders[0].query = global.babel;
  } else if (globals) {
    globals.babel = defaults.config.module.loaders[0].query;
  }

  return utils.mergeParameters(defaults, parameters);
}

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
   * @param {Object} [globals] The global configuration store of the tasks
   *                           Globals are used to set up defaults
   * @param {Object} globals.babel The babel configuration to use in babel-loader
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
  register(gulp, taskName, parameters, globals) {
    const installDependenciesTaskName = taskName + '-install-dependencies';
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: _.pick(pkg.devDependencies, [
        'babel-loader',
        'babel-polyfill',
        'babel-preset-es2015',
        'babel-preset-react',
        'babel-preset-stage-0',
        'json-loader',
        'webpack'
      ])
    });

    const cleanUpTaskName = taskName + '-clean';
    gulp.task(cleanUpTaskName, [installDependenciesTaskName], (done) => {
      Promise.all(
        [].concat(buildConfig(parameters, globals).config)
          .map(webpackConfig => {
            return del([webpackConfig.output.path], { force: true });
          })
      ).then(() => done()).catch(e => done(e));
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], (done) => {
      const webpack = require('webpack');
      const config = buildConfig(parameters, globals);
      const bundler = webpack(config.config);
      const logStats = stats => {
        if (stats) {
          const statsJson = stats.toJson();
          console.log(// eslint-disable-line no-console
            statsJson.errors.concat(statsJson.warnings).join('') ||
            'Successful compiling'
          );
        }
      };

      if (config.watch) {
        let counter = 0;
        bundler.watch(200, (err, stats) => {
          logStats(stats);

          if (err || ++counter === (config.config.length || 1)) {
            done(err);
          }
        });
      } else {
        bundler.run((err, stats) => {
          logStats(stats);
          done(err || (stats.hasErrors() ? new Error('There were errors while compiling') : null));
        });
      }
    });
  }
};
