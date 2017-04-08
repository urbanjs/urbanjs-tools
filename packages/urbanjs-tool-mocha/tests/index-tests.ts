import {join} from 'path';
import * as expect from 'assert';
import * as mkdirp from 'mkdirp';
import * as yargs from 'yargs';
import * as gulp from 'gulp';
import {
  container,
  IShellService,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_MKDIRP
} from '@tamasmagedli/urbanjs-tools-core';

describe('Mocha task', () => {
  let shellService: IShellService;
  let fsService: IFileSystemService;

  before(() => {
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    container.bind(TYPE_DRIVER_MKDIRP).toConstantValue(mkdirp);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
    fsService = container.get<IFileSystemService>(TYPE_SERVICE_FILE_SYSTEM);
  });

  it('should be able to run the tests successfully', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'valid-project'),
      expectToLog: '1 passing'
    });
  });

  it('should fail if runner cannot be set up', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'runner-init-failure'),
      expectToFail: true,
      expectToLog: [
        'Error: Invalid setup file',
        'Could not setup mocha runners.'
      ]
    });
  });

  // it.skip('should fail if runner cannot be set up 2', async () => {
  //   await shellService.runCommand('gulp mocha', {
  //     cwd: join(__dirname, 'runner-init-failure-2'),
  //     expectToFail: true,
  //     expectToLog: [
  //       'Error: File not found',
  //       'Could not setup mocha runners.'
  //     ]
  //   });
  // });

  it('should fail if tests fail', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'failed-test'),
      expectToFail: true,
      expectToLog: 'true == false'
    });
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToLog: 'Unexpected token'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'default-configuration'),
      expectToLog: '1 passing'
    });
  });

  it('should be able to handle typescript source', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'typescript-source'),
      expectToLog: '1 passing'
    });
  });

  it('should retrieve correct error messages (sourceMap)', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'source-map-support'),
      expectToFail: true,
      expectToLog: 'index-test.ts:3:11'
    });
  });

  it('should support command line options', async () => {
    await shellService.runCommand('gulp mocha --mocha.grep="caseA"', {
      cwd: join(__dirname, 'cli-options'),
      expectToLog: '1 passing'
    });
  });

  it('should support parallel execution', async () => {
    const projectPath = join(__dirname, 'parallel-execution');

    await await shellService.runCommand('gulp mocha', {
      cwd: projectPath,
      expectToLog: '2 passing'
    });

    await new Promise((resolve, reject) => {
      let i = 0;
      gulp.src(join(projectPath, 'coverage/_partial/**/coverage*.json'))
        .on('data', () => {
          i += 1;
        })
        .on('finish', () => {
          try {
            expect.equal(i, 2);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
    });
  });

  it('should collect coverage information (even with parallel execution)', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'coverage-information'),
      expectToLog: [
        'Statements   : 100% \\( 9/9 \\)',
        'Branches     : 100% \\( 4/4 \\)',
        'Functions    : 100% \\( 1/1 \\)',
        'Lines        : 100% \\( 8/8 \\)'
      ]
    });
  });

  it('should collect coverage information even with failed tests', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'coverage-information-with-failed-test'),
      expectToFail: true,
      expectToLog: [
        'Error: Test\\(s\\) failed',
        'Statements   : 100% \\( 9/9 \\)',
        'Branches     : 100% \\( 4/4 \\)',
        'Functions    : 100% \\( 1/1 \\)',
        'Lines        : 100% \\( 8/8 \\)'
      ]
    });
  });

  it('should support coverage thresholds', async () => {
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, 'coverage-thresholds'),
      expectToFail: true,
      expectToLog: 'Coverage thresholds are not met'
    });
  });

  it('should clean the output folder automatically', async () => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/dist/asd.txt`);
    const coveragePath = join(__dirname, `${projectName}/dist/coverage-final.json`);

    await fsService.writeFile(filePath, '');
    await shellService.runCommand('gulp mocha', {
      cwd: join(__dirname, projectName),
      expectToLog: '1 passing'
    });

    const fileExists = await fsService.exists(filePath);
    expect.equal(fileExists, false);
    const coverageExists = await fsService.exists(coveragePath);
    expect.equal(coverageExists, true);
  });
});
