'use strict';

const _ = require('lodash');
const helper = require('./helper-config');
const fs = require('../../utils/helper-fs');
const npmInstall = require('../npm-install');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals) {
  const defaults = require('./defaults');
  const tsLoader = defaults.module.loaders[0];
  const babelLoader = defaults.module.loaders[1];

  if (globals.babel) {
    babelLoader.query = globals.babel;
  } else {
    globals.babel = babelLoader.query; // eslint-disable-line
  }

  if (globals.typescript) {
    tsLoader.loader = helper.getTSLoader(globals.typescript, globals.babel);
  } else {
    // should come from defaults to be in sync
    // but we would need string parse (.loader)
    // see helper-config.js
    globals.typescript = require('../../utils/global-typescript'); // eslint-disable-line
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

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'awesome-typescript-loader',
      'babel-loader',
      'json-loader',
      'typescript',
      'webpack'
    ].concat(
      dependencyHelper.babelConfig
    )
  ),

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
          .map(webpackConfig => fs.remove(webpackConfig.output.path))
      ).then(() => done()).catch(done);
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
    gulp.task(watchTaskName, [installDependenciesTaskName, cleanUpTaskName], () => {
      const config = buildConfig(parameters, globals);
      const bundler = require('webpack')(config);

      bundler.watch(200, (err, stats) => {
        if (err) {
          console.log(err); // eslint-disable-line no-console
          return;
        }

        logStats(stats);
      });
    });
  }
};
