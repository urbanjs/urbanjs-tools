'use strict';

const _ = require('lodash');
const globals = require('../../index-globals');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const path = require('path');
const preprocessor = require('../../utils/helper-preprocessor');
const through2 = require('through2');
const vfs = require('vinyl-fs');

function prepareSources(src) {
  return new Promise((resolve, reject) => {
    vfs.src(src)
      .pipe(through2.obj((file, enc, cb) => {
        const transpiledCode = preprocessor.transpile(
          file.contents.toString(),
          file.path,
          globals.babel,
          globals.typescript
        );

        file.contents = new Buffer(transpiledCode, enc); // eslint-disable-line

        cb(null, file);
      }))
      .pipe(istanbul({
        includeUntested: true
      }))
      .pipe(istanbul.hookRequire())
      .on('error', reject)
      .on('finish', () => resolve());
  });
}

function writeCoverage(src, istanbulConfig) {
  return new Promise((resolve, reject) => {
    vfs.src(src)
      .pipe(istanbul.writeReports(istanbulConfig))
      .on('error', reject)
      .on('finish', () => resolve());
  });
}

function runTests(src, mochaOptions) {
  return new Promise((resolve, reject) => {
    vfs.src(src, { read: false })
      .pipe(mocha(mochaOptions))
      .on('error', reject)
      .on('end', () => resolve());
  });
}

/**
 * @param {Object} config - any native mocha options
 * @param {string|string[]} config.require
 * @param {string|string[]} config.files
 * @param {boolean} config.collectCoverage
 * @param {string|string[]} [config.coverageFrom]
 * @param {string} [config.coverageDirectory]
 */
process.on('message', (config) => {
  if (config.require) {
    [].concat(config.require)
      .forEach(file => require(file)); // eslint-disable-line
  }

  let hasError = false;
  let promise = Promise.resolve();

  if (config.collectCoverage) {
    promise = promise.then(() =>
      prepareSources(config.coverageFrom)
    );
  }

  promise = promise.then(() =>
    runTests(config.files, _.omit(config, 'require')).catch(() => {
      hasError = true;
    })
  );

  if (config.collectCoverage) {
    promise = promise.then(() =>
      writeCoverage(config.coverageFrom, {
        reporters: ['json'],
        dir: path.join(
          config.coverageDirectory,
          '_partial',
          `${process.pid}`
        )
      })
    );
  }

  promise.then(
    () => process.exit(hasError ? 1 : 0),
    () => process.exit(1)
  );
});
