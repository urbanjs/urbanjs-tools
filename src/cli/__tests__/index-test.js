'use strict';

import index from '../index';
import mockGenerate from '../generate';
import Yargs from 'yargs/yargs';

jest.unmock('../index.js');
jest.unmock('../../lib/helper-yargs.js');

describe('CLI - index command', () => {
  let mockYargs;

  beforeEach(() => {
    // kind of a real yargs...
    mockYargs = new Yargs();
    mockGenerate.run.mockClear();
    mockGenerate.run.mockReturnValue(Promise.resolve());
  });

  pit('accepts options yargs instance as second arguments', () => {
    expect(() => {
      index.run(['-v']);
    }).not.toThrow();

    const mockShowHelp = jest.genMockFunction().mockReturnValue(mockYargs);
    mockYargs.showHelp = mockShowHelp;
    return index.run(['-h'], mockYargs).catch(err => {
      expect(err.message).toBe('Help');
      expect(mockShowHelp.mock.calls.length).toBe(1);
    });
  });

  pit('shows help if empty or unknown command/option is given', () => {
    const mockShowHelp = jest.genMockFunction().mockReturnValue(mockYargs);
    const reset = () => {
      mockYargs.reset();
      mockYargs.showHelp = mockShowHelp;
    };

    // empty args
    reset();
    return index.run([], mockYargs)
      .catch(() => {
        expect(mockShowHelp.mock.calls.length).toBe(1);
        reset();

        // unknown command given
        return index.run(['unknown'], mockYargs);
      })
      .catch(() => {
        expect(mockShowHelp.mock.calls.length).toBe(2);
        reset();

        // unknown option given
        return index.run(['-uo'], mockYargs);
      })
      .catch(() => {
        expect(mockShowHelp.mock.calls.length).toBe(3);
        reset();

        // known command given, help is not needed
        return index.run(['generate'], mockYargs);
      })
      .catch(() => {
        expect(mockShowHelp.mock.calls.length).toBe(3);
        reset();

        // known command but invalid options are given
        // command should take care of it
        return index.run(['generate', '-e'], mockYargs);
      })
      .catch(() => {
        expect(mockShowHelp.mock.calls.length).toBe(3);
      });
  });

  it('runs the generate task', () => {
    // mock showHelp not to log anything
    mockYargs.showHelp = jest.genMockFunction().mockReturnValue(mockYargs);

    index.run([], mockYargs);
    expect(mockGenerate.run.mock.calls.length).toBe(0);

    mockYargs.reset();
    index.run(['generate'], mockYargs);
    expect(mockGenerate.run.mock.calls.length).toBe(1);
  });

  pit('returns a promise', () => {
    const promises = [];

    [
      { args: ['-v'] },
      { args: ['-h'], error: 'Help' },
      { args: ['generate'] },
      { args: [], error: 'Invalid argument' },
      { args: ['unknown'], error: 'Unknown argument: unknown' },
      { args: ['-u'], error: 'Unknown argument: u' }
    ].forEach(options => {
      mockYargs.reset();
      let promise = index.run(options.args, mockYargs);
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

  pit('returns the promise of the given command', () => {
    const value = { command: true };
    mockGenerate.run.mockReturnValue(Promise.resolve(value));
    return index.run(['generate'], mockYargs).then(commandValue => {
      expect(commandValue).toBe(value);
    });
  });
});
