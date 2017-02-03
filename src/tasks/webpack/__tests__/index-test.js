'use strict';

import { join } from 'path';
import { runCommand, extendJasmineTimeout, testLoggerLib } from '../../../utils/helper-tests';
import { exists, writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('Webpack task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  it('should bundle the source files successfully', async () => {
    const projectName = 'valid-project';
    await runCommand(['gulp webpack', {
      cwd: join(__dirname, projectName),
      expectToContain: 'Successful compiling'
    }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });

  it('should fail if bundling is not successfull', () =>
    runCommand(['gulp webpack', {
      cwd: join(__dirname, 'failed-bundling'),
      expectToFail: true,
      expectToContain: 'Unexpected token'
    }])
  );

  it('should clean the output folder automatically', async () => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/dist/asd.txt`);

    await writeFile(filePath, '');
    await runCommand(['gulp webpack', { cwd: join(__dirname, projectName) }]);

    const fileExists = await exists(filePath);
    expect(fileExists).toBe(false);
  });

  it('should accept array as configuration', async () => {
    const projectName = 'array-configuration';
    await runCommand(['gulp webpack', { cwd: join(__dirname, projectName) }]);

    const outputExists = await exists(join(__dirname, `${projectName}/dist/index.js`));
    expect(outputExists).toBe(true);

    const output2Exists = await exists(join(__dirname, `${projectName}/dist/index2.js`));
    expect(output2Exists).toBe(true);
  });

  it('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp webpack', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Unexpected token'
    }])
  );

  it('should use default configuration without specific parameters', async () => {
    const projectName = 'default-configuration';
    await runCommand(['gulp webpack', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });

  it('should be able to handle typescript source', async () => {
    const projectName = 'typescript-source';
    await runCommand(['gulp webpack', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });

  it('should emit the output even if compiler throws errors', async () => {
    const projectName = 'typescript-error';
    await runCommand(['gulp webpack', {
      cwd: join(__dirname, projectName),
      expectToFail: true,
      expectToContain: 'Type \'1\' is not assignable to type \'string\''
    }]);

    const sourceExists = await exists(join(__dirname, `${projectName}/dist/index.js`));
    expect(sourceExists).toBe(true);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);
  });

  it('should support command line options', async () => {
    const projectName = 'cli-options';
    await runCommand(['gulp webpack --webpack.entry="./index2.js"', {
      cwd: join(__dirname, projectName),
      expectToContain: 'Successful compiling'
    }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });
});
