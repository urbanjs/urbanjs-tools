'use strict';

const _ = require('lodash');
const del = require('del');
const npmInstall = require('./npm-install');
const path = require('path');
const pkg = require('../package.json');
const configHelper = require('./lib/helper-config.js');

function buildConfig(parameters, globals) {
  const defaults = require('./jest-defaults');

  if (!globals.babel) {
    globals.babel = require('./lib/global-babel'); // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

function runJest(parameters, globals, watch) {
  const jest = require('jest-cli');
  const config = buildConfig(parameters, globals);

  // add globals to the environment variables of the process
  // as jest will create multiple processes to run tests in parallel
  // see index-globals.js for more information
  process.env.urbanJSToolGlobals = JSON.stringify(globals);

  return new Promise((resolve, reject) => {
    jest.runCLI(
      {
        config,

        // jest-cli has a bug, it looks for these options
        // on the given argv and not in the config
        testPathPattern: config.testPathPattern,
        testPathIgnorePatterns: config.testPathIgnorePatterns,

        watch: watch ? 'all' : undefined
      },
      config.rootDir,
      success => (success ? resolve() : reject(new Error('Error: tests failed.')))
    );
  });
}

/**
 * @module tasks/jest
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'babel-core',
    'babel-polyfill',
    'babel-preset-es2015',
    'babel-preset-react',
    'babel-preset-stage-0',
    'babel-preset-jest',
    'jest-cli',
    'readdir'
  ]),

  /**
   * @function
   * @description This task is responsible for running the jest unit tests.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jest.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jest',
   *   { rootDir: require('path').join(__dirname + 'src') }
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
      del(['coverage'], { force: true }).then(() => {
        done();
      });
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], (done) => {
      runJest(parameters, globals).then(done, done);
    });

    const watchTaskName = `${taskName}:watch`;
    gulp.task(watchTaskName, [installDependenciesTaskName], (done) => {
      runJest(parameters, globals, true).then(done, done);
    });
  }
};
