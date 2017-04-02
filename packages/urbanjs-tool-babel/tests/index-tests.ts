import {join} from 'path';
import * as yargs from 'yargs';
import * as mkdirp from 'mkdirp';
import * as expect from 'assert';
import {
  container,
  IShellService,
  IFileSystemService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_MKDIRP,
  TYPE_SERVICE_FILE_SYSTEM
} from '@tamasmagedli/urbanjs-tools-core';

function testLogger(loggerPath: string) {
  delete require.cache[require.resolve(loggerPath)];
  const Logger = require(loggerPath).Logger; //tslint:disable-line

  const logs = [];
  const logger = new Logger(message => logs.push(message));
  logger.log('a', 'b', 'c');
  expect.deepEqual(logs, ['a', 'b', 'c']);
}

describe('Babel task', () => {
  let shellService: IShellService;
  let fsService: IFileSystemService;

  before(() => {
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    container.bind(TYPE_DRIVER_MKDIRP).toConstantValue(mkdirp);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
    fsService = container.get<IFileSystemService>(TYPE_SERVICE_FILE_SYSTEM);
  });

  it('should transpile the source code successfully', async () => {
    const projectName = 'valid-project';

    await shellService.runCommand('gulp babel', {
      cwd: join(__dirname, projectName)
    });

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    testLogger(`./${projectName}/dist/index.js`);
  });

  it('should fail if transpilation is not successfull', async () => {
    await shellService.runCommand('gulp babel', {
      cwd: join(__dirname, 'failed-transpilation'),
      expectToFail: true,
      expectToLog: 'Unexpected token'
    });
  });

  it('should clean the output folder', async () => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/dist/asd.txt`);

    await fsService.writeFile(filePath, '');
    await shellService.runCommand('gulp babel', {cwd: join(__dirname, projectName)});

    const fileExists = await fsService.exists(filePath);
    expect.equal(fileExists, false);
  });

  it('should allow to skip sourcemap generation', async () => {
    const projectName = 'skip-sourcemap';
    await shellService.runCommand('gulp babel', {cwd: join(__dirname, projectName)});

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, false);
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp babel', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToLog: 'Unexpected token'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    const projectName = 'default-configuration';
    await shellService.runCommand('gulp babel', {cwd: join(__dirname, projectName)});

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    testLogger(`./${projectName}/dist/index.js`);
  });

  it('should be able to handle typescript source', async () => {
    const projectName = 'typescript-source';
    await shellService.runCommand('gulp babel', {cwd: join(__dirname, projectName)});

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    const declarationFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.d.ts`));
    expect.equal(declarationFileExists, true);

    testLogger(`./${projectName}/dist/index.js`);
  });

  it('should emit the output even if compiler throws errors', async () => {
    const projectName = 'typescript-error';
    await shellService.runCommand('gulp babel', {cwd: join(__dirname, projectName)});

    const sourceFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js`));
    expect.equal(sourceFileExists, true);

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    const declarationFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.d.ts`));
    expect.equal(declarationFileExists, true);
  });

  it('should support command line options', async () => {
    const projectName = 'cli-options';
    await shellService.runCommand('gulp babel --babel.files="index2.js"', {
      cwd: join(__dirname, projectName)
    });

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index2.js.map`));
    expect.equal(mapFileExists, true);

    testLogger(`./${projectName}/dist/index2.js`);
  });
});
