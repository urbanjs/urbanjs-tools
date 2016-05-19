'use strict';

import _ from 'lodash';
import { exec } from 'child-process-promise';

export function runCommand(command) {
  const commandString = command[0];
  const config = Object.assign({
    env: _.omit(process.env, 'urbanJSToolGlobals')
  }, command[1]);

  return exec(commandString, config)
    .then(
      (childProcesses) => {
        if (config.expectToFail) {
          console.log('stdout:\n', childProcesses.stdout); // eslint-disable-line no-console
          throw new Error('Expected to fail');
        }

        return childProcesses.stdout;
      },

      err => {
        if (!config.allowToFail && !config.expectToFail) {
          console.log(`${commandString} has failed`); // eslint-disable-line no-console
          console.log('error:\n', err.message); // eslint-disable-line no-console
          console.log('stderr:\n', err.stderr); // eslint-disable-line no-console
          console.log('stdout:\n', err.stdout); // eslint-disable-line no-console
          throw err;
        }

        return [err.message, err.stderr, err.stdout].join('\n');
      }
    )
    .then(output => {
      const testRegex = config.expectToContain && new RegExp(config.expectToContain);
      if (testRegex && !testRegex.test(output)) {
        console.log('output:\n', output); // eslint-disable-line no-console
        throw new Error(`Expected to contain: ${config.expectToContain}`);
      }
    });
}

export function runCommands(commands, options) {
  let promise = Promise.resolve();
  while (commands.length) {
    const command = commands.shift();
    promise = promise.then(() => runCommand([
      command[0],
      Object.assign({}, options, command[1])
    ]));
  }

  return promise;
}

export function extendJasmineTimeout(jasmine, setCb, restoreCb, timeout) {
  const jasmineDefaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  setCb(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout || 300000; // eslint-disable-line
  });

  restoreCb(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = jasmineDefaultTimeout; // eslint-disable-line
  });
}

export function testLoggerLib(lib) {
  const logs = [];
  const logger = new lib.Logger(message => logs.push(message));
  logger.log('a', 'b', 'c');
  expect(logs).toEqual(['a', 'b', 'c']);
}
