'use strict';

import _ from 'lodash';
import { exec } from 'child-process-promise';

export function runCommand(command) {
  const commandString = command[0];
  const config = Object.assign({
    env: _.omit(process.env, 'urbanJSToolGlobals')
  }, command[1]);

  return exec(commandString, config)
    .then(() => {
      if (config.expectToFail) {
        throw new Error('Expected to fail');
      }
    })
    .catch(err => {
      if (!config.allowToFail && !config.expectToFail) {
        console.log(config); // eslint-disable-line no-console
        console.log(`${commandString} has failed`); // eslint-disable-line no-console
        console.log(err.stderr || err.stdout || err); // eslint-disable-line no-console
        throw err;
      }
    });
}

export function runCommands(commands) {
  let promise = Promise.resolve();
  while (commands.length) {
    const command = commands.shift();
    promise = promise.then(() => runCommand(command));
  }

  return promise;
}
