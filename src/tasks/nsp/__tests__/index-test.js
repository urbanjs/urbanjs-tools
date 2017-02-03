'use strict';

import { join } from 'path';
import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';

describe('NSP task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  it('should pass with secure packages', () =>
    runCommand(['gulp nsp', { cwd: join(__dirname, 'valid-project') }])
  );

  it('should throw error with insecure packages', () =>
    runCommand(['gulp nsp', {
      cwd: join(__dirname, 'package-with-vulnerability'),
      expectToFail: true,
      expectToContain: 'marked   0.3.5'
    }])
  );

  it('should use default configuration without specific parameters', () =>
    runCommand(['gulp nsp', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToContain: 'marked   0.3.5'
    }])
  );

  it('should use .nsprc automatically in the project root', () =>
    runCommand(['gulp nsp', { cwd: join(__dirname, 'nsprc') }])
  );

  it('should fail if nsp cannot handle the given package.json', () =>
    runCommand(['gulp nsp', {
      cwd: join(__dirname, 'invalid-package-file'),
      expectToFail: true,
      expectToContain: 'Got an invalid response from Node Security'
    }])
  );

  it('should be able to accept array of package files', () =>
    runCommand(['gulp nsp', { cwd: join(__dirname, 'multiple-package-file') }])
  );

  it('should support command line options', () =>
    runCommand(['gulp nsp --nsp.packageFile="package2.json"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToContain: 'marked   0.3.5'
    }])
  );
});
