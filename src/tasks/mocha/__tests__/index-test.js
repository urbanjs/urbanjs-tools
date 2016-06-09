'use strict';

import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { join } from 'path';

describe('Mocha task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should be able to run the tests successfully', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'valid-project'),
      expectToContain: '1 passing'
    }])
  );

  pit('should fail if tests fail', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'failed-test'),
      expectToFail: true,
      expectToContain: 'true == false'
    }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Unexpected token \\(4:21\\)'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'default-configuration'),
      expectToContain: '1 passing'
    }])
  );

  pit('should be able to handle typescript source', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'typescript-source'),
      expectToContain: '1 passing'
    }])
  );

  pit('should retrieve correct error messages (sourceMap)', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'source-map-support'),
      expectToFail: true,
      expectToContain: 'index-test.ts:3:11'
    }])
  );
});
