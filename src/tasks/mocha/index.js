'use strict';

const _ = require('lodash');
const configHelper = require('../../utils/helper-config');
const dependencyHelper = require('../../utils/helper-dependencies');
const fs = require('../../utils/helper-fs');
const npmInstall = require('../npm-install');
const os = require('os');
const path = require('path');
const pkg = require('../../../package.json');

function buildConfig(parameters, globals, processOptionPrefix) {
  const defaults = require('./defaults');

  if (!globals.babel) {
    globals.babel = require('../../utils/global-babel'); // eslint-disable-line no-param-reassign
  }

  if (!globals.typescript) {
    globals.typescript = require('../../utils/global-typescript'); // eslint-disable-line
  }

  const config = configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
  if (config.collectCoverage) {
    const coverageDirectoryPath = config.coverageDirectory || 'coverage';
    config.coverageDirectory = path.isAbsolute(coverageDirectoryPath)
      ? coverageDirectoryPath
      : path.join(process.cwd(), coverageDirectoryPath);
  }

  return config;
}

/**
 * @param {Object} coverageOptions
 * @param {boolean} coverageOptions.collectCoverage
 * @param {string|string[]} coverageOptions.coverageReporters
 * @param {string|string[]} coverageOptions.coverageFrom
 * @param {string} coverageOptions.coverageDirectory
 * @param {Object} coverageOptions.coverageThresholds - see istanbul-threshold-checker package
 * @return {Promise}
 */
function collectCoverageFromParticles(coverageOptions) {
  const istanbul = require('istanbul');
  const thresholdChecker = require('istanbul-threshold-checker');
  const through2 = require('through2');
  const vfs = require('vinyl-fs');

  return new Promise((resolve, reject) => {
    const collector = new istanbul.Collector();

    vfs.src(path.join(coverageOptions.coverageDirectory, '**/coverage*.json'))
      .pipe(through2.obj((file, enc, cb) => {
        try {
          collector.add(JSON.parse(file.contents));
        } catch (e) { // eslint-disable-line no-empty
        }

        cb();
      }))
      .on('finish', () => {
        const reporter = new istanbul.Reporter(
          istanbul.config.loadFile(null, {
            reporting: { dir: coverageOptions.coverageDirectory }
          })
        );

        reporter.addAll(coverageOptions.coverageReporters);

        try {
          reporter.write(collector, true);
        } catch (e) { // eslint-disable-line no-empty
        }

        if (coverageOptions.coverageThresholds) {
          const results = thresholdChecker.checkFailures(
            coverageOptions.coverageThresholds,
            collector.getFinalCoverage()
          );

          const passGlobal = type => !(type.global && type.global.failed);
          const passEach = type => !(type.each && type.each.failed);
          if (!results.every(type => passGlobal(type) && passEach(type))) {
            reject(new Error('Coverage thresholds'));
            return;
          }
        }

        resolve();
      });
  });
}

/**
 * @param {string[][]} filesets - array of glob strings arrays
 * @param {Object} runnerOptions - see runner.js
 * @param {Number} concurrency
 * @returns {Promise}
 */
function runFilesetsInParallel(filesets, runnerOptions, concurrency) {
  const childProcessPromise = require('child-process-promise'); // eslint-disable-line

  const errors = [];
  const promises = [];

  const promise = (function next(remainingFilesets) {
    if (remainingFilesets.length < 1) {
      return Promise.all(promises);
    }

    if (promises.length < concurrency) {// eslint-disable-line
      const promiseIndex = promises.length;
      const currentPromise = childProcessPromise.fork(path.join(__dirname, 'runner.js'), []);

      currentPromise.childProcess.send(Object.assign({}, runnerOptions, {
        files: remainingFilesets[0]
      }));

      promises.push(
        currentPromise
          .catch(e => errors.push(e))
          .then(() => promises.splice(promiseIndex, 1))
      );

      return next(remainingFilesets.slice(1), promises);
    }

    return Promise.race(promises)
      .then(() => next(remainingFilesets, promises));
  }(filesets));

  return promise
    .then(() => (
      runnerOptions.collectCoverage
        ? collectCoverageFromParticles(runnerOptions)
        : null
    ))
    .then(() => {
      if (errors.length) {
        throw errors;
      }
    });
}

/**
 * @module tasks/mocha
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'child-process-promise',
      'gulp-mocha',
      'gulp-istanbul',
      'istanbul',
      'istanbul-threshold-checker',
      'source-map-support',
      'through2',
      'vinyl-fs'
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

    const cleanUpTaskName = `${taskName}-clean`;
    gulp.task(cleanUpTaskName, (done) => {
      const config = buildConfig(parameters, globals, taskName);
      if (config.collectCoverage && config.coverageDirectory) {
        fs.remove(config.coverageDirectory, { force: true }).then(
          () => done(),
          done
        );

        return;
      }

      done();
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], (done) => {
      const config = buildConfig(parameters, globals, taskName);

      // add globals to the environment variables of the process
      // see index-globals.js for more information
      process.env.urbanJSToolGlobals = JSON.stringify(globals);

      const runnerOptions = _.omit(config, 'files', 'maxConcurrency');
      const concurrency = config.maxConcurrency > 0
        ? config.maxConcurrency
        : os.cpus().length;

      let filesets = [[]];
      [].concat(config.files).forEach((glob) => {
        if (glob instanceof Array) {
          filesets.push(glob);
        } else {
          filesets[0].push(glob);
        }
      });
      filesets = filesets.filter(fileset => fileset.length);

      runFilesetsInParallel(filesets, runnerOptions, concurrency).then(
        () => done(),
        done
      );
    });

    const watchTaskName = `${taskName}:watch`;
    gulp.task(watchTaskName, [installDependenciesTaskName], (done) => {
      const config = buildConfig(parameters, globals, taskName);
      gulp.watch(config.files, [taskName], done);
    });
  }
};
