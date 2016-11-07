'use strict';

import { join } from 'path';
import { runCommand, runCommands, extendJasmineTimeout } from '../../../utils/helper-tests';

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
      ['gulp check-dependencies', {
        expectToFail: true,
        expectToContain: 'You have critical outdated packages:\n- del'
      }]
    ], { cwd: join(__dirname, 'outdated-package') })
  );

  pit('should not fail if unused package found, only warning should come up', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'unused-package'),
      expectToContain: 'You might have unused dependencies:\n- del'
    }])
  );

  pit('should fail if missing package found', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'missing-package'),
      expectToFail: true,
      expectToContain: 'Missing dependencies:\ndel'
    }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Missing dependencies:\ndel'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToContain: 'Missing dependencies:'
    }])
  );

  pit('should handle files parameter correctly (gulp.src)', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'ignore-filepath')
    }])
  );

  pit('should be able to handle typescript source', () =>
    runCommand(['gulp check-dependencies', {
      cwd: join(__dirname, 'typescript-source'),
      expectToContain: 'You might have unused dependencies:\n- del'
    }])
  );

  pit('should support command line options', async () => {
    const projectPath = 'cli-options';
    const sourceFilePath = join(__dirname, projectPath, 'index2.js');

    runCommand([`gulp check-dependencies --check-dependencies.files="${sourceFilePath}"`, {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToContain: 'Missing dependencies:'
    }]);
  });
});
