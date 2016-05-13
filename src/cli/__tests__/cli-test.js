'use strict';

import fs from '../../lib/helper-fs';
import { runCommands } from '../../lib/helper-tests';
import path from 'path';
import pkg from '../../../package.json';

jest.unmock('../../lib/helper-fs');

const projectName = 'asd';
const packageFolderPath = path.join(__dirname, '../../../');
const projectFolderPath = path.join(packageFolderPath, '../', projectName);

describe('urbanjs cli', () => {
  const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeEach(done => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
    fs.delete(projectFolderPath).then(() => done(), done.fail);
  });

  afterEach(() => {
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

    return runCommands(commands);
  });
});
