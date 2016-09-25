'use strict';

import { join } from 'path';
import { runCommands, extendJasmineTimeout } from '../../../utils/helper-tests';

describe('Retire task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should pass with secure packages', () =>
    runCommands([
      ['npm install'],
      ['gulp retire']
    ], { cwd: join(__dirname, 'valid-project') })
  );

  pit('should throw error with insecure packages', () =>
    runCommands([
      ['npm install'],
      ['gulp retire', {
        expectToFail: true,
        expectToContain: 'marked 0.3.5 has known vulnerabilities'
      }]
    ], { cwd: join(__dirname, 'package-with-vulnerability') })
  );

  pit('should use default configuration without specific parameters', () =>
    runCommands([
      ['npm install'],
      ['gulp retire', {
        expectToFail: true,
        expectToContain: 'marked 0.3.5 has known vulnerabilities'
      }]
    ], { cwd: join(__dirname, 'default-configuration') })
  );

  pit('should use .retireignore automatically in the project root', () =>
    runCommands([
      ['npm install'],
      ['gulp retire']
    ], { cwd: join(__dirname, 'retireignore') })
  );

  pit('should use the given options of retire cli', () =>
    runCommands([
      ['npm install'],
      ['gulp retire']
    ], { cwd: join(__dirname, 'retire-cli-config') })
  );

  pit('should support command line options', () =>
    runCommands([
      ['npm install'],
      ['gulp retire --retire.options="--ignorefile custom-retireignore.txt"']
    ], { cwd: join(__dirname, 'cli-options') })
  );
});
