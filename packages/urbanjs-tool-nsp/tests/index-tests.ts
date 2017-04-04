import {join} from 'path';
import * as yargs from 'yargs';
import {
  container,
  IShellService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS
} from '@tamasmagedli/urbanjs-tools-core';

describe('Nsp task', () => {
  let shellService: IShellService;

  before(() => {
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
  });

  it('should pass with secure packages', async () => {
    await shellService.runCommand('gulp nsp', {cwd: join(__dirname, 'valid-project')});
  });

  it('should throw error with insecure packages', async () => {
    await shellService.runCommand('gulp nsp', {
      cwd: join(__dirname, 'package-with-vulnerability'),
      expectToFail: true,
      expectToLog: 'marked   0.3.5'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    await shellService.runCommand('gulp nsp', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToLog: 'marked   0.3.5'
    });
  });

  it('should use .nsprc automatically in the project root', async () => {
    await shellService.runCommand('gulp nsp', {cwd: join(__dirname, 'nsprc')});
  });

  it('should fail if nsp cannot handle the given package.json', async () => {
    await shellService.runCommand('gulp nsp', {
      cwd: join(__dirname, 'invalid-package-file'),
      expectToFail: true,
      expectToLog: 'Got an invalid response from Node Security'
    });
  });

  it('should be able to accept array of package files', async () => {
    await shellService.runCommand('gulp nsp', {cwd: join(__dirname, 'multiple-package-file')});
  });

  it('should support command line options', async () => {
    shellService.runCommand('gulp nsp --nsp.packageFile="package2.json"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToLog: 'marked   0.3.5'
    });
  });
});
