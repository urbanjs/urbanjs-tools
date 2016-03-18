'use strict';

const _ = require('lodash');
const del = require('del');
const npmInstall = require('./npm-install');
const pkg = require('../package.json');
const configHelper = require('./lib/helper-config.js');

function buildConfig(parameters, globals) {
  const defaults = require('./webpack-defaults');

  if (globals.babel) {
    defaults.module.loaders[0].query = globals.babel;
  } else {
    globals.babel = defaults.module.loaders[0].query; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

function logStats(stats) {
  if (stats) {
    const statsJson = stats.toJson();
    console.log(// eslint-disable-line no-console
      statsJson.errors.concat(statsJson.warnings).join('') ||
      'Successful compiling'
    );
  }
}

/**
 * @module tasks/webpack
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'babel-loader',
    'babel-polyfill',
    'babel-preset-es2015',
    'babel-preset-react',
    'babel-preset-stage-0',
    'json-loader',
    'webpack'
  ]),

  /**
   * @function
   * @description This task is responsible for building the project.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/webpack.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'webpack',
   *   require('path').join(__dirname, 'webpack.config.js')
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    const cleanUpTaskName = `${taskName}-clean`;
    gulp.task(cleanUpTaskName, [installDependenciesTaskName], (done) => {
      Promise.all(
        [].concat(buildConfig(parameters, globals))
          .map(webpackConfig => del([webpackConfig.output.path], { force: true }))
      ).then(() => done()).catch(e => done(e));
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], done => {
      const config = buildConfig(parameters, globals);
      const bundler = require('webpack')(config);

      bundler.run((err, stats) => {
        logStats(stats);
        done(err || (stats.hasErrors() ? new Error('There were errors while compiling') : null));
      });
    });

    const watchTaskName = `${taskName}:watch`;
    gulp.task(watchTaskName, [installDependenciesTaskName, cleanUpTaskName], done => {
      const config = buildConfig(parameters, globals);
      const bundler = require('webpack')(config);
      let counter = 0;

      bundler.watch(200, (err, stats) => {
        logStats(stats);

        if (err || ++counter === (config.length || 1)) {
          done(err);
        }
      });
    });
  }
};
