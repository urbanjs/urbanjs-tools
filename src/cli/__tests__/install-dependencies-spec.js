'use strict';

import installDependencies from '../install-dependencies';
import mockNpmInstallTask from '../../tasks/npm-install';
import mockEslintTask from '../../tasks/eslint';
import mockRetireTask from '../../tasks/retire';
import yargs from 'yargs';

jest.unmock('../install-dependencies.js');
jest.unmock('../../utils/helper-yargs.js');
jest.unmock('yargs');

describe('CLI - install dependencies command', () => {
  let mockYargs;

  beforeEach(() => {
    // kind of a real yargs...
    mockYargs = yargs.reset();
    mockNpmInstallTask.install.mockClear();
  });

  pit('accepts options yargs instance as second arguments', () => {
    expect(() => {
      installDependencies.run(['-h']);
    }).not.toThrow();

    const mockShowHelp = jest.genMockFunction().mockReturnValue(mockYargs);
    mockYargs.showHelp = mockShowHelp;
    return installDependencies.run(['-h'], mockYargs).catch(() => {
      expect(mockShowHelp.mock.calls.length).toBe(1);
    });
  });

  pit('shows help if there are missing/unknown options', () => {
    const mockShowHelp = jest.genMockFunction().mockReturnValue(mockYargs);
    const reset = () => {
      mockYargs.reset();
      mockYargs.showHelp = mockShowHelp;
    };

    // empty args
    reset();
    return installDependencies.run([], mockYargs)
      .catch(() => {
        expect(mockShowHelp.mock.calls.length).toBe(1);
        reset();

        // unknown option given
        return installDependencies.run(['-uo'], mockYargs);
      })
      .catch(() => {
        expect(mockShowHelp.mock.calls.length).toBe(2);
        reset();

        // correct args, help is not required
        return installDependencies.run(['-t', 'eslint'], mockYargs);
      })
      .then(() => {
        expect(mockShowHelp.mock.calls.length).toBe(2);
      });
  });

  pit('returns a promise', () => {
    const promises = [];

    [
      { args: ['-t', 'eslint'] },
      { args: ['-t', 'eslint', '-g'] },
      { args: ['-t', 'eslint', '-l'] },
      { args: ['-t', 'eslint', '-v'] },
      { args: ['-t', 'eslint', '-e'], error: 'Unknown argument: e' },
      { args: [], error: 'Missing required argument: t' },
      { args: ['-g'], error: 'Missing required argument: t' }
    ].forEach(options => {
      mockYargs.reset();
      let promise = installDependencies.run(options.args, mockYargs);
      expect(promise instanceof Promise).toBe(true);

      if (options.error) {
        promise = promise.catch(err => {
          expect(err.message).toBe(options.error);
        });
      }

      promises.push(promise);
    });

    return Promise.all(promises);
  });

  pit('uses the npm install task', async() => {
    await installDependencies.run(['-t', 'eslint']);

    const mockInstall = mockNpmInstallTask.install.mock;
    expect(mockInstall.calls.length).toBe(1);
    expect(mockInstall.calls[0][0]).toEqual(mockEslintTask.dependencies);
    expect(mockInstall.calls[0][1]).toEqual({ global: false, link: false, verbose: false });
  });

  pit('passes the right options to the npm install task', async() => {
    const mockInstall = mockNpmInstallTask.install.mock;
    const options = { global: false, link: false, verbose: false };

    await installDependencies.run(['-t', 'eslint']);
    expect(mockInstall.calls.length).toBe(1);
    expect(mockInstall.calls[0][0]).toEqual(mockEslintTask.dependencies);
    expect(mockInstall.calls[0][1]).toEqual(options);
    mockNpmInstallTask.install.mockClear();

    await installDependencies.run(['-t', 'eslint', '-g']);
    expect(mockInstall.calls.length).toBe(1);
    expect(mockInstall.calls[0][0]).toEqual(mockEslintTask.dependencies);
    expect(mockInstall.calls[0][1]).toEqual(Object.assign({}, options, { global: true }));
    mockNpmInstallTask.install.mockClear();

    await installDependencies.run(['-t', 'eslint', '-v']);
    expect(mockInstall.calls.length).toBe(1);
    expect(mockInstall.calls[0][0]).toEqual(mockEslintTask.dependencies);
    expect(mockInstall.calls[0][1]).toEqual(Object.assign({}, options, { verbose: true }));
    mockNpmInstallTask.install.mockClear();

    await installDependencies.run(['-t', 'eslint', '-l']);
    expect(mockInstall.calls.length).toBe(1);
    expect(mockInstall.calls[0][0]).toEqual(mockEslintTask.dependencies);
    expect(mockInstall.calls[0][1]).toEqual(Object.assign({}, options, { link: true }));
    mockNpmInstallTask.install.mockClear();
  });

  pit('accepts multiple tasks', async() => {
    const mockInstall = mockNpmInstallTask.install.mock;
    await installDependencies.run(['-t', 'eslint', 'retire']);
    expect(mockInstall.calls.length).toBe(2);
    expect(mockInstall.calls[0][0]).toEqual(mockEslintTask.dependencies);
    expect(mockInstall.calls[1][0]).toEqual(mockRetireTask.dependencies);
  });

  pit('fails if unknown task is given', async() => {
    try {
      await installDependencies.run(['-t', 'eslint2']);
      throw new Error('Expect to fail');
    } catch (err) {
      expect(err.message).toBe('Unknown task: eslint2');
    }
  });
});
