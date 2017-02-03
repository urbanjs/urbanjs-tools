'use strict';

import { join } from 'path';
import { extendJasmineTimeout, runCommand } from '../../../utils/helper-tests';

describe('Check file names task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  it('should pass with valid file & folder names', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'valid-project')
    }])
  );

  it('should fail if invalid file name found', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'invalid-file-name'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );

  it('should fail if invalid folder name found', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'invalid-folder-name'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );

  it('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );

  it('should use default configuration without specific parameters', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );

  it('should support command line options', () =>
    runCommand(['gulp check-file-names --check-file-names.paramCase="**"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToContain: 'Invalid file name at'
    }])
  );
});
