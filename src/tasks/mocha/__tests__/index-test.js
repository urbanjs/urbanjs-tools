'use strict';

import { join } from 'path';
import vfs from 'vinyl-fs';
import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { exists, writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('Mocha task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should be able to run the tests successfully', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'valid-project'),
      expectToContain: '1 passing'
    }])
  );

  pit('should fail if runner cannot be set up', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'runner-init-failure'),
      expectToFail: true,
      expectToContain: [
        'Error: Invalid setup file',
        'Error: Could not setup mocha runners.'
      ]
    }])
  );

  pit('should fail if runner cannot be set up 2', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'runner-init-failure-2'),
      expectToFail: true,
      expectToContain: [
        'Error: File not found',
        'Error: Could not setup mocha runners.'
      ]
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
      expectToContain: 'Unexpected token'
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

  pit('should support command line options', () =>
    runCommand(['gulp mocha --mocha.grep="caseA"', {
      cwd: join(__dirname, 'cli-options'),
      expectToContain: '1 passing'
    }])
  );

  pit('should support parallel execution', async() => {
    const projectPath = join(__dirname, 'parallel-execution');

    await runCommand(['gulp mocha', {
      cwd: projectPath,
      expectToContain: '2 passing'
    }]);

    await new Promise((resolve, reject) => {
      let i = 0;
      vfs.src(join(projectPath, 'coverage/_partial/**/coverage*.json'))
        .on('data', () => i++) // eslint-disable-line
        .on('finish', () => {
          try {
            expect(i).toBe(2);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
    });
  });

  pit('should collect coverage information (even with parallel execution)', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'coverage-information'),
      expectToContain: [
        'Statements   : 100% \\( 8/8 \\)',
        'Branches     : 100% \\( 4/4 \\)',
        'Functions    : 100% \\( 1/1 \\)',
        'Lines        : 100% \\( 7/7 \\)'
      ]
    }])
  );

  pit('should collect coverage information even with failed tests', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'coverage-information-with-failed-test'),
      expectToFail: true,
      expectToContain: [
        'Error: Test\\(s\\) failed',
        'Statements   : 100% \\( 8/8 \\)',
        'Branches     : 100% \\( 4/4 \\)',
        'Functions    : 100% \\( 1/1 \\)',
        'Lines        : 100% \\( 7/7 \\)'
      ]
    }])
  );

  pit('should support coverage thresholds', () =>
    runCommand(['gulp mocha', {
      cwd: join(__dirname, 'coverage-thresholds'),
      expectToFail: true,
      expectToContain: 'Error: Coverage thresholds'
    }])
  );

  pit('should clean the output folder automatically', async() => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/dist/asd.txt`);
    const coveragePath = join(__dirname, `${projectName}/dist/coverage-final.json`);

    await writeFile(filePath, '');
    await runCommand(['gulp mocha', {
      cwd: join(__dirname, projectName),
      expectToContain: '1 passing'
    }]);

    const fileExists = await exists(filePath);
    expect(fileExists).toBe(false);
    const coverageExists = await exists(coveragePath);
    expect(coverageExists).toBe(true);
  });
});
