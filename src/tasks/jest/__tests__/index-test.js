'use strict';

import { join } from 'path';
import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { exists, writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('Jest task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should be able to run the tests successfully', () =>
    runCommand(['gulp jest', {
      cwd: join(__dirname, 'valid-project'),
      expectToContain: '1 test passed'
    }])
  );

  pit('should fail if tests fail', () =>
    runCommand(['gulp jest', {
      cwd: join(__dirname, 'failed-test'),
      expectToFail: true,
      expectToContain: 'Expected'
    }])
  );

  pit('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp jest', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'Unexpected token \\(3:19\\)'
    }])
  );

  pit('should use default configuration without specific parameters', () =>
    runCommand(['gulp jest', {
      cwd: join(__dirname, 'default-configuration'),
      expectToContain: '1 test passed'
    }])
  );

  pit('should be able to handle typescript source', () =>
    runCommand(['gulp jest', {
      cwd: join(__dirname, 'typescript-source'),
      expectToContain: '1 test passed'
    }])
  );

  pit('should clean the output folder automatically', async() => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/dist/asd.txt`);

    await writeFile(filePath, '');
    await runCommand(['gulp jest', {
      cwd: join(__dirname, projectName),
      expectToContain: '1 test passed'
    }]);

    const fileExists = await exists(filePath);
    expect(fileExists).toBe(false);
  });

  pit('should support command line options', () =>
    runCommand(['gulp jest --jest.rootDir="src2"', {
      cwd: join(__dirname, 'cli-options'),
      expectToContain: '1 test passed'
    }])
  );
});
