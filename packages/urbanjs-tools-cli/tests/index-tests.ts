import {Container} from 'inversify';
import {join} from 'path';
import * as yargs from 'yargs';
import * as mkdirp from 'mkdirp';
import * as del from 'del';
import {
  containerModule as core,
  IShellService,
  IFileSystemService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_MKDIRP,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_DRIVER_DEL
} from 'urbanjs-tools-core';

describe('cli', () => {
  const urbanjsCliPath = join(__dirname, '../bin');
  const projectName = 'asd';
  const projectFolderPath = join(__dirname, '../temp/', projectName);

  let shellService: IShellService;
  let fsService: IFileSystemService;

  before(() => {
    const container = new Container();
    container.load(core);
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    container.bind(TYPE_DRIVER_MKDIRP).toConstantValue(mkdirp);
    container.bind(TYPE_DRIVER_DEL).toConstantValue(del);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
    fsService = container.get<IFileSystemService>(TYPE_SERVICE_FILE_SYSTEM);
  });

  beforeEach(async () => {
    await fsService.remove(projectFolderPath);
  });

  it('should be able to generate new project', async () => {
    await shellService.runCommand(`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`, {
      expectToLog: 'Project skeleton has been successfully generated.'
    });
  });

  it('should not be able to generate new project if the target folder exists', async () => {
    await shellService.runCommandsInSequence([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`, {
        expectToFail: true,
        expectToLog: /The folder .+ is existing/
      }]
    ]);
  });

  it('should be able to generate new project with -f even if the target folder exists', async () => {
    await shellService.runCommandsInSequence([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],
      [`node "${urbanjsCliPath}" generate -f -n ${projectFolderPath}`, {
        expectToLog: 'Project skeleton has been successfully generated.'
      }]
    ]);
  });

  it('should be able to run the tasks of the generated project (javascript)', async () => {
    await shellService.runCommandsInSequence([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath}`],

      ['gulp babel', {cwd: projectFolderPath}],
      ['gulp check-dependencies', {cwd: projectFolderPath}],
      ['gulp check-file-names', {cwd: projectFolderPath}],
      ['gulp conventional-changelog', {cwd: projectFolderPath}],
      ['gulp eslint', {cwd: projectFolderPath}],
      ['gulp jsdoc', {cwd: projectFolderPath}],
      ['gulp mocha', {cwd: projectFolderPath}],
      ['gulp nsp', {cwd: projectFolderPath}],
      ['gulp retire', {cwd: projectFolderPath}],
    ]);
  });

  it('should be able to run the tasks of the generated project (typescript)', async () => {
    await shellService.runCommandsInSequence([
      [`node "${urbanjsCliPath}" generate -n ${projectFolderPath} -t ts`],

      ['gulp babel', {cwd: projectFolderPath}],
      ['gulp check-dependencies', {cwd: projectFolderPath}],
      ['gulp check-file-names', {cwd: projectFolderPath}],
      ['gulp conventional-changelog', {cwd: projectFolderPath}],
      ['gulp mocha', {cwd: projectFolderPath}],
      ['gulp nsp', {cwd: projectFolderPath}],
      ['gulp retire', {cwd: projectFolderPath}],
      ['gulp tslint', {cwd: projectFolderPath}]
    ]);
  });
});
