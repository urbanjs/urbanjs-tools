'use strict';

import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { join } from 'path';
import { exists } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

function testLoggerLib(lib) {
  const logs = [];
  const logger = new lib.Logger(message => logs.push(message));
  logger.log('a', 'b', 'c');
  expect(logs).toEqual(['a', 'b', 'c']);
}

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

  pit('should allow to skip sourcemap generation', async() => {
    const projectName = 'skip-sourcemap';
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(false);
  });

  pit('should use global configuration if parameters are not defined', async() => {
    const projectName = 'global-configuration';
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });

  pit('should use default configuration without specific parameters', async() => {
    const projectName = 'default-configuration';
    await runCommand(['gulp babel', { cwd: join(__dirname, projectName) }]);

    const mapFileExists = await exists(join(__dirname, `${projectName}/dist/index.js.map`));
    expect(mapFileExists).toBe(true);

    testLoggerLib(require.requireActual(`./${projectName}/dist/index.js`));
  });
});
