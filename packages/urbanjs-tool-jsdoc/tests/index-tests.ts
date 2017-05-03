import {Container} from 'inversify';
import {join} from 'path';
import * as yargs from 'yargs';
import * as expect from 'assert';
import * as mkdirp from 'mkdirp';
import {
  containerModule as core,
  IShellService,
  IFileSystemService,
  TYPE_DRIVER_MKDIRP,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS,
  TYPE_SERVICE_FILE_SYSTEM
} from 'urbanjs-tools-core';

describe('jsdoc task', () => {
  let shellService: IShellService;
  let fsService: IFileSystemService;

  before(() => {
    const container = new Container();
    container.load(core);
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    container.bind(TYPE_DRIVER_MKDIRP).toConstantValue(mkdirp);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
    fsService = container.get<IFileSystemService>(TYPE_SERVICE_FILE_SYSTEM);
  });

  it('should be able to generate documentation', async () => {
    const projectName = 'valid-project';
    await shellService.runCommand('gulp jsdoc', {cwd: join(__dirname, projectName)});

    const documentationExists = await fsService.exists(join(
      __dirname, projectName, 'help/module-main.html'));
    expect.equal(documentationExists, true);
  });

  it('should clean the output folder automatically', async () => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/help/asd.txt`);

    await fsService.writeFile(filePath, '');
    await shellService.runCommand('gulp jsdoc', {cwd: join(__dirname, projectName)});

    const fileExists = await fsService.exists(filePath);
    expect.equal(fileExists, false);
  });

  it('should not fail if source input is empty', async () => {
    await shellService.runCommand('gulp jsdoc', {
      cwd: join(__dirname, 'missing-source-files')
    });
  });

  it('should fail if required parameters are missing', async () => {
    await shellService.runCommand('gulp jsdoc', {
      cwd: join(__dirname, 'missing-parameters'),
      expectToFail: true,
      expectToLog: 'Config file need to define the output folder'
    });
  });

  it('should fail if config file is unparsable', async () => {
    await shellService.runCommand('gulp jsdoc', {
      cwd: join(__dirname, 'unparsable-config-file'),
      expectToFail: true,
      expectToLog: 'Config file cannot be found/parsed'
    });
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp jsdoc', {
      cwd: join(__dirname, 'global-configuration')
    });
  });

  it('should use default configuration without specific parameters', async () => {
    await shellService.runCommand('gulp jsdoc', {
      cwd: join(__dirname, 'default-configuration')
    });
  });

  it('should be able to handle typescript source', async () => {
    const projectName = 'typescript-source';
    await shellService.runCommand('gulp jsdoc', {cwd: join(__dirname, projectName)});

    const documentationExists = await fsService.exists(join(
      __dirname, projectName, 'help/module-main.html'));
    expect.equal(documentationExists, true);
  });

  it('should support command line options', async () => {
    await shellService.runCommand('gulp jsdoc --jsdoc.configFile="jsdoc.json"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToLog: 'Config file need to define the output folder'
    });
  });
});
