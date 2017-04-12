import 'reflect-metadata';
import {omit} from 'lodash';
import * as istanbul from 'gulp-istanbul';
import * as mocha from 'gulp-mocha';
import {join} from 'path';
import * as through2 from 'through2';
import * as gulp from 'gulp';
import {
  TYPE_SERVICE_TRANSPILE,
  TYPE_SERVICE_LOGGER,
  ILoggerService,
  ITranspileService
} from '@tamasmagedli/urbanjs-tools-core';
import * as messages from './messages';
import {Message, MochaOptions, RunnerMessage} from './types';
import {container} from './setup-file';

const loggerService = container.get<ILoggerService>(TYPE_SERVICE_LOGGER);
const transpileService = container.get<ITranspileService>(TYPE_SERVICE_TRANSPILE);

function prepareSources(src: string | string[]) {
  return new Promise((resolve, reject) => {
    gulp.src(src)
      .pipe(through2.obj((file: { contents: Buffer, path: string }, enc: string, cb: Function) => {
        const transpiledCode = transpileService.transpile(file.contents.toString(), file.path);

        file.contents = new Buffer(transpiledCode, enc);

        cb(null, file);
      }))
      .pipe(istanbul({includeUntested: true}))
      .pipe(istanbul.hookRequire())
      .on('error', reject)
      .on('finish', () => resolve());
  });
}

function writeCoverage(src: string | string[], istanbulConfig: Object) {
  return new Promise((resolve, reject) => {
    gulp.src(src)
      .pipe(istanbul.writeReports(istanbulConfig))
      .on('error', reject)
      .on('finish', () => resolve());
  });
}

function runTests(src: string | string[], mochaOptions: MochaOptions) {
  return new Promise((resolve, reject) => {
    gulp.src(src, {read: false})
      .pipe(mocha(mochaOptions))
      .on('error', reject)
      .on('end', () => resolve());
  });
}

// avoid overlaps
let promise = Promise.resolve();

process.on('message', (message: Message) => {
  const messageId = message.id;
  const type = message.type;
  const config = <MochaOptions>(message.payload || {files: []});

  if (type === messages.MESSAGE_INIT) {
    promise = promise
      .then(() => {
        if (config.require) {
          [].concat(config.require)
            .forEach(file => require(file)); // tslint:disable-line
        }

        return config.collectCoverage && prepareSources(config.coverageFrom);
      })
      .then(
        () => process.send(<RunnerMessage>{
          type: messages.MESSAGE_DONE,
          payload: {
            target: messageId,
            memoryUsage: process.memoryUsage()
          }
        }),
        (e) => {
          loggerService.error('Cannot initialize runner', e);
          process.exit(1);
        }
      );
  } else if (type === messages.MESSAGE_WORK) {
    promise = promise
      .then(() => runTests(config.files, <MochaOptions>omit(config, 'require')))
      .then(
        () => process.send(<RunnerMessage>{
          type: messages.MESSAGE_DONE,
          payload: {
            target: messageId,
            memoryUsage: process.memoryUsage()
          }
        }),
        (e) => {
          loggerService.error('Mocha failed', e);
          process.send({
            type: messages.MESSAGE_DONE,
            payload: {
              target: messageId,
              hasError: true,
              memoryUsage: process.memoryUsage()
            }
          });
        }
      );
  } else if (type === messages.MESSAGE_CLOSE) {
    promise = promise
      .then(() => config.collectCoverage && writeCoverage(config.coverageFrom, {
        reporters: ['json'],
        dir: join(
          config.coverageDirectory,
          '_partial',
          `${process.pid}`
        )
      }))
      .then(
        () => process.exit(0),
        (e) => {
          loggerService.error('Could not collect coverage information properly', e);
          process.exit(1);
        }
      );
  }
});
