'use strict';

import { join } from 'path';
import { runCommand, extendJasmineTimeout, testLoggerLib } from '../../../utils/helper-tests';
import { exists, writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('Babel task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should transpile the source code successfully', async() => {
    const projectName = 'valid-project';
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });

  pit('should fail if transpilation is not successfull', () =>
    runCommand(['gulp babel', {
      cwd: join(__dirname, 'failed-transpilation'),
      expectToFail: true,
      expectToContain: 'Unexpected token'
    }])
  );

  pit('should clean the output folder automatically', async() => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/dist/asd.txt`);

    await writeFile(filePath, '');
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const fileExists = await exists(filePath);
    expect(fileExists).toBe(false);
  });

  pit('should allow to skip sourcemap generation', async() => {
    const projectName = 'skip-sourcemap';
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(false);
  });

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp babel', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Unexpected token'
    }])
  );

  pit('should use default configuration without specific parameters', async() => {
    const projectName = 'default-configuration';
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });

  pit('should be able to handle typescript source', async() => {
    const projectName = 'typescript-source';
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    const declarationFileExists = await exists(join(__dirname, `${projectName}/dist/index.d.ts`));
    expect(declarationFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });

  pit('should emit the output even if compiler throws errors', async() => {
    const projectName = 'typescript-error';

    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const sourceFileExists = await exists(join(__dirname, `${projectName}/dist/index.js`));
    expect(sourceFileExists).toBe(true);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    const declarationFileExists = await exists(join(__dirname, `${projectName}/dist/index.d.ts`));
    expect(declarationFileExists).toBe(true);
  });

  pit('should support command line options', async() => {
    const projectName = 'cli-options';

    await runCommand(['gulp babel --babel.files="index2.js"', {
      cwd: join(__dirname, projectName)
    }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index2.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index2.js`));
  });
});
