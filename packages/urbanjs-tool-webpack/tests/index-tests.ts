import {Container} from 'inversify';
import {join} from 'path';
import * as yargs from 'yargs';
import * as mkdirp from 'mkdirp';
import * as expect from 'assert';
import {
  containerModule as core,
  IShellService,
  IFileSystemService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_MKDIRP,
  TYPE_SERVICE_FILE_SYSTEM
} from 'urbanjs-tools-core';

function testLogger(loggerPath: string) {
  delete require.cache[require.resolve(loggerPath)];
  const Logger = require(loggerPath).Logger; //tslint:disable-line

  const logs = [];
  const logger = new Logger(message => logs.push(message));
  logger.log('a', 'b', 'c');
  expect.deepEqual(logs, ['a', 'b', 'c']);
}

describe('Webpack task', () => {
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

  it('should bundle the source files successfully', async () => {
    const projectName = 'valid-project';
    await shellService.runCommand('gulp webpack', {
      cwd: join(__dirname, projectName),
      expectToLog: 'Successful compiling'
    });

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    testLogger(`./${projectName}/dist/index.js`);
  });

  it('should emit the output even if compiler throws errors (syntax error)', async () => {
    const projectName = 'failed-bundling';
    await shellService.runCommand('gulp webpack', {
      cwd: join(__dirname, projectName),
      expectToLog: 'Unexpected token'
    });

    const sourceExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js`));
    expect.equal(sourceExists, true);

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);
  });

  it('should clean the output folder automatically', async () => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/dist/asd.txt`);

    await fsService.writeFile(filePath, '');
    await shellService.runCommand('gulp webpack', {cwd: join(__dirname, projectName)});

    const fileExists = await fsService.exists(filePath);
    expect.equal(fileExists, false);
  });

  it('should accept array as configuration', async () => {
    const projectName = 'array-configuration';
    await shellService.runCommand('gulp webpack', {cwd: join(__dirname, projectName)});

    const outputExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js`));
    expect.equal(outputExists, true);

    const output2Exists = await fsService.exists(join(__dirname, `${projectName}/dist/index2.js`));
    expect.equal(output2Exists, true);
  });

  it('should use global configuration if parameters are not defined', async () => {
    await shellService.runCommand('gulp webpack', {
      cwd: join(__dirname, 'global-configuration'),
      expectToLog: 'Unexpected token'
    });
  });

  it('should use default configuration without specific parameters', async () => {
    const projectName = 'default-configuration';
    await shellService.runCommand('gulp webpack', {cwd: join(__dirname, projectName)});

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    testLogger(`./${projectName}/dist/index.js`);
  });

  it('should be able to handle typescript source', async () => {
    const projectName = 'typescript-source';
    await shellService.runCommand('gulp webpack', {cwd: join(__dirname, projectName)});

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    testLogger(`./${projectName}/dist/index.js`);
  });

  it('should emit the output even if compiler throws errors', async () => {
    const projectName = 'typescript-error';
    await shellService.runCommand('gulp webpack', {
      cwd: join(__dirname, projectName),
      expectToLog: 'Type \'1\' is not assignable to type \'string\''
    });

    const sourceExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js`));
    expect.equal(sourceExists, true);

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);
  });

  it('should support command line options', async () => {
    const projectName = 'cli-options';
    await shellService.runCommand('gulp webpack --webpack.entry="./index2.js"', {
      cwd: join(__dirname, projectName),
      expectToLog: 'Successful compiling'
    });

    const mapFileExists = await fsService.exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect.equal(mapFileExists, true);

    testLogger(`./${projectName}/dist/index.js`);
  });
});
