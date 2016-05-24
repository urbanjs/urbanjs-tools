'use strict';

import { runCommand, runCommands, extendJasmineTimeout } from '../../../utils/helper-tests';
import { join } from 'path';
import { writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('ESLint task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should pass with valid source', () =>
    runCommand(['gulp eslint', { cwd: join(__dirname, 'valid-project') }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp eslint', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'space-before-function-paren'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp eslint', { cwd: join(__dirname, 'default-configuration') }])
  );

  pit('should be able to fix the fixable issues', async() => {
    const projectName = 'fix-task';
    const projectPath = join(__dirname, projectName);
    const fixableContent = 'export function method () {\n};';

    await writeFile(join(__dirname, projectName, 'index.js'), fixableContent);
    await runCommands([
      ['gulp eslint:fix'],
      ['gulp eslint']
    ], { cwd: projectPath });
  });
});
