'use strict';

import { join } from 'path';
import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';

jest.unmock('../../../utils/helper-fs');

describe('TSlint task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should pass with valid source', () =>
    runCommand(['gulp tslint', { cwd: join(__dirname, 'valid-project') }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp tslint', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Calls to \'console.log\' are not allowed'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp tslint', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToContain: 'Calls to \'console.log\' are not allowed'
    }])
  );

  pit('should allow to configure file extensions', () =>
    runCommand(['gulp tslint', {
      cwd: join(__dirname, 'file-extensions'),
      expectToFail: true,
      expectToContain: 'Calls to \'console.log\' are not allowed'
    }])
  );

  pit('should be able to handle mixed sources', () =>
    runCommand(['gulp tslint', {
      cwd: join(__dirname, 'mixed-sources')
    }])
  );

  pit('should support command line options', () =>
    runCommand(['gulp tslint --tslint.files="index-invalid.ts"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToContain: 'Calls to \'console.log\' are not allowed'
    }])
  );
});
