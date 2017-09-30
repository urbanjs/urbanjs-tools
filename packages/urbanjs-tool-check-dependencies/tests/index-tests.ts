import {Container} from 'inversify';
import {join} from 'path';
import * as yargs from 'yargs';
import {
  containerModule as core,
  IShellService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS
} from 'urbanjs-tools-core';

describe('Check dependencies task', () => {
  let shellService: IShellService;

  before(() => {
    const container = new Container();
    container.load(core);
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
  });

  it('should pass with up-to-date & without unused packages', async () => {
    await shellService.runCommandsInSequence(
      [
        ['npm install'],
        ['gulp check-dependencies']
      ],
      {cwd: join(__dirname, 'valid-project')}
    );
  });

  it('should not fail if uninstalled package found', async () => {
    await shellService.runCommand('gulp check-dependencies', {
      cwd: join(__dirname, 'uninstalled-package')
    });
  });

  it('should fail if outdated package found', async () => {
    await shellService.runCommandsInSequence(
      [
        ['npm install del@2.0.0 --no-save'],
        ['gulp check-dependencies', {
          expectToFail: true,
          expectToLog: 'You have critical outdated packages:\n- del'
        }]
      ],
      {cwd: join(__dirname, 'outdated-package')}
    );
  });

  it('should not fail if unused package found, only warning should come up', async () => {
    await shellService.runCommand('gulp check-dependencies', {
      cwd: join(__dirname, 'unused-package'),
      expectToLog: 'You might have unused dependencies:\n- del'
    });
  });

  it('should fail if missing package found', async () => {
    await shellService.runCommand('gulp check-dependencies', {
      cwd: join(__dirname, 'missing-package'),
      expectToFail: true,
      expectToLog: 'Missing dependencies:\ndel'
    });
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp check-dependencies', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToLog: 'Missing dependencies:\ndel'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    await shellService.runCommand('gulp check-dependencies', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToLog: 'Missing dependencies:'
    });
  });

  it('should handle files parameter correctly (gulp.src)', async () => {
    await shellService.runCommand('gulp check-dependencies', {
      cwd: join(__dirname, 'ignore-filepath')
    });
  });

  it('should be able to handle typescript source', async () => {
    await shellService.runCommand('gulp check-dependencies', {
      cwd: join(__dirname, 'typescript-source'),
      expectToLog: 'You might have unused dependencies:\n- del'
    });
  });

  it('should support command line options', async () => {
    const projectPath = 'cli-options';
    const sourceFilePath = join(__dirname, projectPath, 'index2.js');

    await shellService.runCommand(`gulp check-dependencies --check-dependencies.files="${sourceFilePath}"`, {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToLog: 'Missing dependencies:'
    });
  });
});
