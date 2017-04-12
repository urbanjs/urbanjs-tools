import {Container} from 'inversify';
import {join} from 'path';
import * as yargs from 'yargs';
import {
  containerModule as core,
  IShellService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS
} from '@tamasmagedli/urbanjs-tools-core';

describe('TSlint task', () => {
  let shellService: IShellService;

  before(() => {
    const container = new Container();
    container.load(core);
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
  });

  it('should pass with valid source', async () => {
    await shellService.runCommand('gulp tslint', {cwd: join(__dirname, 'valid-project')});
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp tslint', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToLog: 'Calls to \'console.log\' are not allowed'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    await shellService.runCommand('gulp tslint', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToLog: 'Calls to \'console.log\' are not allowed'
    });
  });

  it('should allow to configure file extensions', async () => {
    await shellService.runCommand('gulp tslint', {
      cwd: join(__dirname, 'file-extensions'),
      expectToFail: true,
      expectToLog: 'Calls to \'console.log\' are not allowed'
    });
  });

  it('should be able to handle mixed sources', async () => {
    await shellService.runCommand('gulp tslint', {
      cwd: join(__dirname, 'mixed-sources')
    });
  });

  it('should support command line options', async () => {
    await shellService.runCommand('gulp tslint --tslint.files="index-invalid.ts"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToLog: 'Calls to \'console.log\' are not allowed'
    });
  });
});
