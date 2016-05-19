'use strict';

import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { join } from 'path';

describe('NSP task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should pass with secure packages', () =>
    runCommand(['gulp nsp', { cwd: join(__dirname, 'valid-project') }])
  );

  pit('should throw error with insecure packages', () =>
    runCommand(['gulp nsp', {
      cwd: join(__dirname, 'package-with-vulnerability'),
      expectToFail: true,
      expectToContain: 'marked   0.3.5'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp nsp', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToContain: 'marked   0.3.5'
    }])
  );

  pit('should use .nsprc automatically in the project root', () =>
    runCommand(['gulp nsp', { cwd: join(__dirname, 'nsprc') }])
  );

  pit('should fail if nsp cannot handle the given package.json', () =>
    runCommand(['gulp nsp', {
      cwd: join(__dirname, 'invalid-package-file'),
      expectToFail: true,
      expectToContain: 'Got an invalid response from Node Security'
    }])
  );

  pit('should be able to accept array of package files', () =>
    runCommand(['gulp nsp', { cwd: join(__dirname, 'multiple-package-file') }])
  );
});
