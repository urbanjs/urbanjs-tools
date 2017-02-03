'use strict';

const _ = require('lodash');
const childProcess = require('child_process');
const configHelper = require('../../utils/helper-config');
const dependencyHelper = require('../../utils/helper-dependencies');
const fs = require('../../utils/helper-fs');
const npmInstall = require('../npm-install');
const os = require('os');
const path = require('path');
const pkg = require('../../../package.json');
const messages = require('./messages');

let numberOfMessages = 0;
const newMessageId = () => numberOfMessages++; //eslint-disable-line

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

function createNewRunner(mochaConfig) {
  return new Promise((resolve, reject) => {
    let initialized = false;
    const initMessageId = newMessageId();
    const runner = childProcess.fork(path.join(__dirname, 'runner.js'), {
      silent: true
    });

    let outputBuffer = [];
    const showOutput = () => {
      if (outputBuffer.length) {
        console.log(outputBuffer.join('')); // eslint-disable-line
        outputBuffer = [];
      }
    };

    runner.stdout.on('data', message => outputBuffer.push(message));
    runner.stderr.on('data', message => outputBuffer.push(message));
    runner.on('message', (message) => {
      if (message.type === messages.DONE) {
        runner.memoryUsage = message.payload.memoryUsage;
        showOutput();

        if (message.payload.target === initMessageId) {
          initialized = true;
          resolve(runner);
        }
      }
    });

    runner.on('close', () => {
      showOutput();

      if (!initialized) {
        reject(new Error('Could not setup mocha runners.'));
      }
    });

    runner.send({
      id: initMessageId,
      type: messages.INIT,
      payload: mochaConfig
    });
  });
}

function closeRunner(runner, mochaConfig) {
  return new Promise((resolve) => {
    runner.on('close', (code) => {
      if (code !== 0) {
        console.error( // eslint-disable-line
          'Coverage information could not be collected from runner.');
        runner.send('SIGKILL');
      }

      resolve();
    });

    runner.send({
      type: messages.CLOSE,
      payload: mochaConfig
    });
  });
}

function runFileset(runner, fileset, mochaConfig) {
  return new Promise((resolve, reject) => {
    const messageId = newMessageId();
    runner.on('message', (message) => {
      if (message.type === messages.DONE && message.payload.target === messageId) {
        if (message.payload && message.payload.hasError) {
          reject();
          return;
        }

        resolve();
      }
    });

    runner.send({
      id: messageId,
      type: messages.WORK,
      payload: Object.assign({}, mochaConfig, {
        files: fileset
      })
    });
  });
}

/**
 * @private
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

    vfs.src(path.join(coverageOptions.coverageDirectory, '_partial/**/coverage*.json'))
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
          reporter.write(collector, true, () => {
          });
        } catch (e) { // eslint-disable-line no-empty
          // TODO: there are bugs in istanbul reporters and false alarms might happen
          // reject(e);
          // return;
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
 * @private
 * @param {string[][]} filesets - array of glob strings arrays
 * @param {Object} mochaConfig - see runner.js
 * @param {Object} runnerOptions
 * @param {number} runnerOptions.maxConcurrency
 * @param {number} runnerOptions.runnerMemoryUsageLimit
 * @returns {Promise}
 */
function runFilesetsInParallel(filesets, mochaConfig, runnerOptions) {
  let hasError = false;
  const promises = [];
  const freeRunners = [];

  const promise = (function next(remainingFilesets) {
    if (remainingFilesets.length < 1) {
      return Promise.all(promises);
    }

    if (freeRunners.length) {// eslint-disable-line
      const currentRunner = freeRunners.pop();
      const currentPromise = runFileset(currentRunner, remainingFilesets[0], mochaConfig)
        .catch(() => {
          hasError = true;
        })
        .then(() => {
          if (!runnerOptions.runnerMemoryUsageLimit ||
            currentRunner.memoryUsage.heapTotal < runnerOptions.runnerMemoryUsageLimit * 1e6) {
            freeRunners.push(currentRunner);
            return Promise.resolve();
          }

          return closeRunner(currentRunner, mochaConfig);
        })
        .then(() => {
          promises.splice(promises.indexOf(currentPromise), 1);
        });

      promises.push(currentPromise);

      return next(remainingFilesets.slice(1));
    } else if ((promises.length + freeRunners.length) < runnerOptions.maxConcurrency) {
      return createNewRunner(mochaConfig).then((newRunner) => {
        freeRunners.push(newRunner);
        return next(remainingFilesets);
      });
    }

    return Promise.race(promises)
      .then(() => next(remainingFilesets));
  }(filesets));

  return promise
    .then(() => Promise.all(freeRunners.map(runner => closeRunner(runner, mochaConfig))))
    .then(() => (
      mochaConfig.collectCoverage
        ? collectCoverageFromParticles(mochaConfig)
        : null
    ))
    .then(() => {
      if (hasError) {
        throw new Error('Test(s) failed.');
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

      const mochaConfig = _.omit(config, 'files', 'maxConcurrency');
      const runnerMemoryUsageLimit = config.runnerMemoryUsageLimit;
      const maxConcurrency = config.maxConcurrency > 0
        ? config.maxConcurrency
        : os.cpus().length;
      const runnerOptions = {
        runnerMemoryUsageLimit,
        maxConcurrency
      };

      let filesets = [[]];
      [].concat(config.files).forEach((glob) => {
        if (glob instanceof Array) {
          filesets.push(glob);
        } else {
          filesets[0].push(glob);
        }
      });
      filesets = filesets.filter(fileset => fileset.length);

      runFilesetsInParallel(filesets, mochaConfig, runnerOptions).then(
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
