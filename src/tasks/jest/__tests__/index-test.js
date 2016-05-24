'use strict';

import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { join } from 'path';

jest.unmock('../../../utils/helper-fs');

describe('Jest task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should be able to generate documentation', () =>
    runCommand(['gulp jest', { cwd: join(__dirname, 'valid-project') }])
  );

  pit('should fail if tests fail', () =>
    runCommand(['gulp jest', {
      cwd: join(__dirname, 'failed-test'),
      expectToFail: true,
      expectToContain: 'Expected:? false toBe:? true'
    }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp jest', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Unexpected token \\(3:19\\)'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp jest', { cwd: join(__dirname, 'default-configuration') }])
  );
});
