'use strict';

const _ = require('lodash');
const fs = require('../../utils/helper-fs');
const npmInstall = require('../npm-install');
const path = require('path');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals) {
  const defaults = require('./defaults');

  if (!globals.babel) {
    globals.babel = require('../../utils/global-babel'); // eslint-disable-line
  }

  if (!globals.typescript) {
    globals.typescript = require('../../utils/global-typescript'); // eslint-disable-line
  }

  return configHelper.mergeParameters(defaults, parameters);
}

function runJest(parameters, globals, watch) {
  const jest = require('jest-cli');
  const config = buildConfig(parameters, globals);

  let coverageDirectoryPath = path.join(process.cwd(), 'coverage');
  if (config.coverageDirectory) {
    coverageDirectoryPath = path.isAbsolute(config.coverageDirectory)
      ? config.coverageDirectory
      : path.join(process.cwd(), config.coverageDirectory);
  }

  // add globals to the environment variables of the process
  // as jest will create multiple processes to run tests in parallel
  // see index-globals.js for more information
  process.env.urbanJSToolGlobals = JSON.stringify(globals);

  return new Promise((resolve, reject) => {
    fs.remove(coverageDirectoryPath)
      .then(() => {
        jest.runCLI(
          {
            config,

            // jest-cli has a bug, it looks for these options
            // on the given argv and not in the config
            testPathPattern: config.testPathPattern,
            testPathIgnorePatterns: config.testPathIgnorePatterns,
            runInBand: config.runInBand,
            maxWorkers: config.maxWorkers,

            watch: watch ? 'all' : undefined
          },
          config.rootDir,
          success => (success ? resolve() : reject(new Error('Error: tests failed.')))
        );
      })
      .catch(reject);
  });
}

/**
 * @module tasks/jest
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'babel-preset-jest',
      'jest-cli'
    ].concat(
      dependencyHelper.runtime,
      dependencyHelper.babelConfig,
      dependencyHelper.transpileHelper
    )
  ),

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

    gulp.task(taskName, [installDependenciesTaskName], (done) => {
      runJest(parameters, globals).then(done, done);
    });

    const watchTaskName = `${taskName}:watch`;
    gulp.task(watchTaskName, [installDependenciesTaskName], (done) => {
      runJest(parameters, globals, true).then(done, done);
    });
  }
};
