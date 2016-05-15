'use strict';

import { runCommand } from '../../../lib/helper-tests';
import { join } from 'path';

describe('Check file names task', () => {
  pit('should pass with valid file & folder names', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'valid-project')
    }])
  );

  pit('should fail if invalid file name found', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'invalid-file-name'),
      expectToFail: true
    }])
  );

  pit('should fail if invalid folder name found', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'invalid-folder-name'),
      expectToFail: true
    }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp check-file-names', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true
    }])
  );
});
