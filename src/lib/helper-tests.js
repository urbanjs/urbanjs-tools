'use strict';

import _ from 'lodash';
import { exec } from 'child-process-promise';

export function runCommand(command) {
  const commandString = command[0];
  const config = Object.assign({
    env: _.omit(process.env, 'urbanJSToolGlobals')
  }, command[1]);

  return exec(commandString, config).then(
    () => {
      if (config.expectToFail) {
        throw new Error('Expected to fail');
      }
    },

    err => {
      if (!config.allowToFail && !config.expectToFail) {
        console.log(config); // eslint-disable-line no-console
        console.log(`${commandString} has failed`); // eslint-disable-line no-console
        console.log(err.stderr || err.stdout || err); // eslint-disable-line no-console
        throw err;
      }
    }
  );
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
