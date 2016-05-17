'use strict';

import { runCommand, runCommands, extendJasmineTimeout } from '../../../lib/helper-tests';
import { join } from 'path';

describe('Check dependencies task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should pass with up-to-date & without unused packages', () =>
    runCommands([
      ['npm install'],
      ['gulp check-dependencies']
    ], { cwd: join(__dirname, 'valid-project') })
  );

  pit('should not fail if uninstalled package found', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'uninstalled-package')
    }])
  );

  pit('should fail if outdated package found', () =>
    runCommands([
      ['npm install del@2.0.0'],
      ['gulp check-dependencies', { expectToFail: true }]
    ], { cwd: join(__dirname, 'outdated-package') })
  );

  pit('should not fail if unused package found, only warning should come up', async() => {
    const stdout = await runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'unused-package')
    }]);

    if (stdout.indexOf('You might have unused dependencies:\n - del\n') === -1) {
      throw new Error('Warning message is missing');
    }
  });

  pit('should fail if missing package found', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'missing-package'),
      expectToFail: true
    }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true
    }])
  );

  pit('should handle files parameter correctly (gulp.src)', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'ignore-filepath')
    }])
  );
});
