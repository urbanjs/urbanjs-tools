'use strict';

import path from 'path';
import fs from '../../utils/helper-fs';
import { runCommand, runCommands, extendJasmineTimeout } from '../../utils/helper-tests';
import pkg from '../../../package.json';

jest.unmock('../../utils/helper-fs');

const urbanjsCliPath = path.join(__dirname, '../../../bin');
const projectName = 'asd';
const packageFolderPath = path.join(__dirname, '../../../');
const projectFolderPath = path.join(packageFolderPath, '../', projectName);

describe('urbanjs cli', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  beforeEach((done) => {
    fs.remove(projectFolderPath).then(() => done(), done.fail);
  });

  it('should be able to generate new project', () =>
    runCommand([`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`])
  );

  it('should not be able to generate new project if the target folder exists', () =>
    runCommands([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`, {
        expectToFail: true,
        expectToContain: /The folder .+ is existing/
      }]
    ])
  );

  it('should be able to generate new project with -f even if the target folder exists', () =>
    runCommands([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" generate -f -n ${projectFolderPath}`]
    ])
  );

  it('should be able to run the tasks of the generated project (javascript)', () =>
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

  it('should be able to run the tasks of the generated project (typescript)', () =>
    runCommands([

      // generate project
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath} -t ts`],

      // install dependencies, use the current repository as urbanjs-tools
      ['npm link'],
      [`npm link ${pkg.name}`, { cwd: projectFolderPath }],
      ['npm install', { cwd: projectFolderPath, allowToFail: true }],

      ['gulp tslint', { cwd: projectFolderPath }]
    ])
  );

  it('should be able to run the not default tasks (mocha, webpack)', async () => {
    await runCommand([`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`]);
    await fs.writeFile(
      path.join(projectFolderPath, 'gulpfile.js'),
      await fs.readFile(path.join(__dirname, 'not-default-tasks/gulpfile'))
    );

    await runCommands([
      ['npm link'],
      [`npm link ${pkg.name}`, { cwd: projectFolderPath }],
      ['npm install', { cwd: projectFolderPath, allowToFail: true }],

      ['gulp conventional-changelog', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp mocha', {
        cwd: projectFolderPath,
        expectToContain: '0 passing'
      }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp tslint', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }],

      ['gulp webpack', { cwd: projectFolderPath }],
      ['npm prune', { cwd: projectFolderPath }]
    ]);
  });
});
