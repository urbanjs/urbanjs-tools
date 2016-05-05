'use strict';

import _ from 'lodash';
import fs from '../../lib/fs';
import path from 'path';
import { exec } from 'child-process-promise';
import pkg from '../../../package.json';

jest.unmock('../../lib/fs');

const projectName = 'asd';
const packageFolderPath = path.join(__dirname, '../../../');
const projectFolderPath = path.join(packageFolderPath, '../', projectName);

const run = command => () => {
  const commandString = command[0];
  const config = Object.assign({
    cwd: packageFolderPath,
    env: _.omit(process.env, 'urbanJSToolGlobals')
  }, command[1]);

  return exec(commandString, config)
    .then(() => console.log(`${commandString} was successful.`)) // eslint-disable-line no-console
    .catch(err => {
      if (!config.allowToFail) {
        console.log(config); // eslint-disable-line no-console
        console.log(`${commandString} has failed`); // eslint-disable-line no-console
        console.log(err.stderr || err.stdout || err); // eslint-disable-line no-console
        throw err;
      }
    });
};

describe('CLI - E2E test', () => {
  const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeAll(done => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
    fs.delete(projectFolderPath).then(() => done(), done.fail);
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  pit('full flow', () => {
    const commands = [

      // test generation task
      [`node bin generate -n ${projectFolderPath}`],
      [`node bin generate -n ${projectFolderPath}`, { allowToFail: true }],
      [`node bin generate -n ${projectFolderPath} -f`],

      // install dependencies, use the current repository as urbanjs-tools
      ['npm link'],
      [`npm link ${pkg.name}`, { cwd: projectFolderPath }],
      ['npm install', { cwd: projectFolderPath, allowToFail: true }],

      // test each gulp task
      ['gulp check-dependencies', { cwd: projectFolderPath }],
      ['gulp check-file-names', { cwd: projectFolderPath }],
      ['gulp eslint', { cwd: projectFolderPath }],
      ['gulp jest', { cwd: projectFolderPath }],
      ['gulp jscs', { cwd: projectFolderPath }],
      ['gulp jsdoc', { cwd: projectFolderPath }],
      ['gulp nsp', { cwd: projectFolderPath, allowToFail: true }],
      ['gulp retire', { cwd: projectFolderPath, allowToFail: true }],

      // build
      ['gulp babel', { cwd: projectFolderPath }],
      ['node dist', { cwd: projectFolderPath }]
    ];

    let promise = Promise.resolve();
    while (commands.length) {
      promise = promise.then(run(commands.shift()));
    }

    return promise;
  });
});
