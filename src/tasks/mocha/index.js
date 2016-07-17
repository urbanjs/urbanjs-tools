'use strict';

const _ = require('lodash');
const npmInstall = require('../npm-install');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals, processOptionPrefix) {
  const defaults = require('./defaults');

  if (!globals.babel) {
    globals.babel = require('../../utils/global-babel'); // eslint-disable-line no-param-reassign
  }

  if (!globals.typescript) {
    globals.typescript = require('../../utils/global-typescript'); // eslint-disable-line
  }

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

/**
 * @module tasks/mocha
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'gulp-spawn-mocha',
      'source-map-support'
    ].concat(
      dependencyHelper.runtime,
      dependencyHelper.babelConfig,
      dependencyHelper.transpileHelper
    )
  ),

  /**
   * @function
   * @description This task is responsible for running the mocha e2e/integration tests.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/mocha.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'mocha',
   *   { files: require('path').join(__dirname + 'src/test/**') }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    gulp.task(taskName, [installDependenciesTaskName], () => {
      const config = buildConfig(parameters, globals, taskName);
      const gulpMocha = require('gulp-spawn-mocha');

      // add globals to the environment variables of the process
      // see index-globals.js for more information
      process.env.urbanJSToolGlobals = JSON.stringify(globals);

      return gulp.src(config.files, { read: false })
        .pipe(gulpMocha(Object.assign(_.omit(config, 'files'))));
    });

    const watchTaskName = `${taskName}:watch`;
    gulp.task(watchTaskName, [installDependenciesTaskName], done => {
      const config = buildConfig(parameters, globals, taskName);
      gulp.watch(config.files, [taskName], done);
    });
  }
};
