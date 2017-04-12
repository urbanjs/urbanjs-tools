import {Container} from 'inversify';
import {join} from 'path';
import * as yargs from 'yargs';
import {
  containerModule as core,
  IShellService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS
} from '@tamasmagedli/urbanjs-tools-core';

describe('Check file names task', () => {
  let shellService: IShellService;

  before(() => {
    const container = new Container();
    container.load(core);
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
  });

  it('should pass with valid file & folder names', async () => {
    await shellService.runCommand('gulp check-file-names', {
      cwd: join(__dirname, 'valid-project')
    });
  });

  it('should fail if invalid file name found', async () => {
    await shellService.runCommand('gulp check-file-names', {
      cwd: join(__dirname, 'invalid-file-name'),
      expectToFail: true,
      expectToLog: 'Invalid file name at'
    });
  });

  it('should fail if invalid folder name found', async () => {
    await shellService.runCommand('gulp check-file-names', {
      cwd: join(__dirname, 'invalid-folder-name'),
      expectToFail: true,
      expectToLog: 'Invalid file name at'
    });
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp check-file-names', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToLog: 'Invalid file name at'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    await shellService.runCommand('gulp check-file-names', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToLog: 'Invalid file name at'
    });
  });

  it('should support command line options', async () => {
    await shellService.runCommand('gulp check-file-names --check-file-names.paramCase="**"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToLog: 'Invalid file name at'
    });
  });
});
