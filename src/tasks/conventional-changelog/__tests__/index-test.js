'use strict';

import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { join } from 'path';
import { readFile, writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('Conventional changelog task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  pit('should generate the changelog successfully', async() => {
    const projectName = 'valid-project';
    const changelogFile = join(__dirname, projectName, 'CHANGELOG.md');

    await writeFile(changelogFile, '');
    await runCommand(['gulp conventional-changelog', { cwd: join(__dirname, projectName) }]);
    const content = await readFile(changelogFile);
    expect(content.length > 0).toBe(true);
  });

  pit('should use default configuration without specific parameters', async() => {
    const projectName = 'default-configuration';
    const changelogFile = join(__dirname, projectName, 'CHANGELOG.md');

    await writeFile(changelogFile, '');
    await runCommand(['gulp conventional-changelog', { cwd: join(__dirname, projectName) }]);
    const content = await readFile(changelogFile);
    expect(content.length > 0).toBe(true);
  });

  pit('should support command line options', async() => {
    const projectName = 'cli-options';
    const changelogFile = join(__dirname, projectName, 'CHANGELOG2.md');
    const option = `--conventional-changelog.changelogFile="${changelogFile}"`;

    await writeFile(changelogFile, '');
    await runCommand([`gulp conventional-changelog ${option}`, {
      cwd: join(__dirname, projectName)
    }]);
    const content = await readFile(changelogFile);
    expect(content.length > 0).toBe(true);
  });
});
