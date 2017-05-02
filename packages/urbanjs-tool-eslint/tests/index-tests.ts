import {Container} from 'inversify';
import {join} from 'path';
import * as mkdirp from 'mkdirp';
import * as yargs from 'yargs';
import {
  containerModule as core,
  IShellService,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_MKDIRP
} from 'urbanjs-tools-core';

describe('ESLint task', () => {
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

  it('should pass with valid source', async () => {
    await shellService.runCommand('gulp eslint', {cwd: join(__dirname, 'valid-project')});
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp eslint', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToLog: 'space-before-function-paren'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    await shellService.runCommand('gulp eslint', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToLog: 'space-before-function-paren'
    });
  });

  it('should be able to fix the fixable issues', async () => {
    const projectName = 'fix-task';
    const projectPath = join(__dirname, projectName);
    const fixableContent = 'export default function method () {\n}\n';

    await fsService.writeFile(join(__dirname, projectName, 'index-invalid.js'), fixableContent);
    await shellService.runCommandsInSequence(
      [
        [
          'gulp eslint',
          {
            expectToFail: true,
            expectToLog: 'space-before-function-paren'
          }
        ],
        ['gulp eslint:fix'],
        ['gulp eslint']
      ],
      {cwd: projectPath}
    );
    await fsService.writeFile(join(__dirname, projectName, 'index-invalid.js'), fixableContent);
  });

  it('should allow to configure file extensions', async () => {
    await shellService.runCommand('gulp eslint', {
      cwd: join(__dirname, 'file-extensions'),
      expectToFail: true,
      expectToLog: 'space-before-function-paren'
    });
  });

  it('should support command line options', async () => {
    await shellService.runCommand('gulp eslint --eslint.files="index-invalid.js"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToLog: 'space-before-function-paren'
    });
  });
});
