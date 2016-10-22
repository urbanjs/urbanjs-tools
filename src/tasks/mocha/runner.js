'use strict';

const _ = require('lodash');
const globals = require('../../index-globals');
const istanbul = require('gulp-istanbul');
const messages = require('./messages');
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

// avoid overlaps
let promise = Promise.resolve();

/**
 * @param {Object} message
 * @param {string} message.type - message type
 * @param {Object} message.payload - any native mocha options
 * @param {string|string[]} [message.payload.require]
 * @param {string|string[]} [message.payload.files]
 * @param {boolean} [message.payload.collectCoverage]
 * @param {string|string[]} [message.payload.coverageFrom]
 * @param {string} [message.payload.coverageDirectory]
 */
process.on('message', (message) => {
  const messageId = message.id;
  const type = message.type;
  const config = message.payload || {};

  if (type === messages.INIT) {
    promise = promise
      .then(() => {
        if (config.require) {
          [].concat(config.require)
            .forEach(file => require(file)); // eslint-disable-line
        }

        return config.collectCoverage && prepareSources(config.coverageFrom);
      })
      .then(
        () => process.send({
          type: messages.DONE,
          payload: { target: messageId }
        }),
        (e) => {
          console.log(e); // eslint-disable-line
          process.exit(1);
        }
      );
  } else if (type === messages.WORK) {
    promise = promise
      .then(() => runTests(config.files, _.omit(config, 'require')))
      .then(
        () => process.send({
          type: messages.DONE,
          payload: { target: messageId }
        }),
        (e) => {
          console.log(e); // eslint-disable-line
          process.send({
            type: messages.DONE,
            payload: { target: messageId, hasError: true }
          });
        }
      );
  } else if (type === messages.CLOSE) {
    promise = promise
      .then(() => config.collectCoverage && writeCoverage(config.coverageFrom, {
        reporters: ['json'],
        dir: path.join(
          config.coverageDirectory,
          '_partial',
          `${process.pid}` //eslint-disable-line
        )
      }))
      .then(
        () => process.exit(0),
        (e) => {
          console.log(e); // eslint-disable-line
          process.exit(1);
        }
      );
  }
});
