'use strict';

import fs from '../../utils/helper-fs';
import { runCommand, runCommands, extendJasmineTimeout } from '../../utils/helper-tests';
import path from 'path';
import pkg from '../../../package.json';

jest.unmock('../../utils/helper-fs');

const urbanjsCliPath = path.join(__dirname, '../../../bin');
const projectName = 'asd';
const packageFolderPath = path.join(__dirname, '../../../');
const projectFolderPath = path.join(packageFolderPath, '../', projectName);

describe('urbanjs cli', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  beforeEach(done => {
    fs.remove(projectFolderPath).then(() => done(), done.fail);
  });

  pit('should be able to generate new project', () =>
    runCommand([`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`])
  );

  pit('should not be able to generate new project if the target folder exists', () =>
    runCommands([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`, {
        expectToFail: true,
        expectToContain: /The folder .+ is existing/
      }]
    ])
  );

  pit('should be able to generate new project with -f even if the target folder exists', () =>
    runCommands([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" generate -f -n ${projectFolderPath}`]
    ])
  );

  pit('should be able to run the tasks of the generated project', () =>
    runCommands([

      // generate project
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],

      // install dependencies, use the current repository as urbanjs-tools
      ['npm link'],
      [`npm link ${pkg.name}`, { cwd: projectFolderPath }],
      ['npm install', { cwd: projectFolderPath, allowToFail: true }],

      // test each gulp task
      // prune after each to test the dependency installation individually
      ['gulp check-dependencies', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp check-file-names', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp eslint', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp jest', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp jscs', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp jsdoc', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp nsp', { cwd: projectFolderPath, allowToFail: true }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp retire', { cwd: projectFolderPath, allowToFail: true }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp babel', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      // test the result only with the prod dependencies
      ['node dist', { cwd: projectFolderPath }]
    ])
  );

  pit('should be able to install dependencies locally', async() => {
    await runCommands([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" install-dependencies -t retire`, { cwd: projectFolderPath }]
    ]);

    const exists = await fs.exists(path.join(projectFolderPath, 'node_modules/retire/bin/retire'));
    expect(exists).toBe(true);
  });

  pit('should be able to install dependencies globally', () =>
    runCommands([
      [`node "${urbanjsCliPath}" install-dependencies -g -t retire`],
      ['retire -n', { cwd: packageFolderPath }]
    ])
  );

  pit('should be able to link globally installed dependencies', async() => {
    await runCommands([
      [`node "${urbanjsCliPath}" install-dependencies -g -t retire`],
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" install-dependencies -l -t retire`, { cwd: projectFolderPath }]
    ]);

    const isSymlink = await fs.isSymlink(path.join(projectFolderPath, 'node_modules/retire'));
    expect(isSymlink).toBe(true);
  });
});
