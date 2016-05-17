'use strict';

import { extendJasmineTimeout, runCommand } from '../../../utils/helper-tests';
import { join } from 'path';

describe('Check file names task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should pass with valid file & folder names', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'valid-project')
    }])
  );

  pit('should fail if invalid file name found', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'invalid-file-name'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );

  pit('should fail if invalid folder name found', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'invalid-folder-name'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );
});
