'use strict';

import { runCommand, runCommands, extendJasmineTimeout } from '../../../utils/helper-tests';
import { join } from 'path';
import { writeFile } from '../../../utils/helper-fs';

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
      expectToContain: 'missing-jsdoc'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp tslint', {
      cwd: join(__dirname, 'default-configuration'),
      expectToFail: true,
      expectToContain: 'missing-jsdoc'
    }])
  );

  pit('should allow to configure file extensions', () =>
    runCommand(['gulp tslint', {
      cwd: join(__dirname, 'file-extensions'),
      expectToFail: true,
      expectToContain: 'missing-jsdoc'
    }])
  );
});
