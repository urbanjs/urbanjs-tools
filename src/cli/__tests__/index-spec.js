'use strict';

import Yargs from 'yargs/yargs';
import index from '../index';
import mockGenerate from '../generate';

jest.unmock('../index.js');
jest.unmock('../../utils/helper-yargs.js');

describe('CLI - index command', () => {
  let mockYargs;

  beforeEach(() => {
    // kind of a real yargs...
    mockYargs = new Yargs();
    mockGenerate.run.mockClear();
    mockGenerate.run.mockReturnValue(Promise.resolve());
  });

  it('accepts options yargs instance as second arguments', () => {
    expect(() => {
      index.run(['-v']);
    }).not.toThrow();

    const mockShowHelp = jest.genMockFunction().mockReturnValue(mockYargs);
    mockYargs.showHelp = mockShowHelp;
    return index.run(['-h'], mockYargs).catch((err) => {
      expect(err.message).toBe('Help');
      expect(mockShowHelp.mock.calls.length).toBe(1);
    });
  });

  it('shows help if empty or unknown command/option is given', () => {
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

    return index.run([], mockYargs).then(
      () => {
        throw new Error('should not pass');
      },
      () => expect(mockGenerate.run.mock.calls.length).toBe(0)
    ).then(() => {
      mockYargs.reset();
      return index.run(['generate'], mockYargs).then(() => {
        expect(mockGenerate.run.mock.calls.length).toBe(1);
      });
    });
  });

  it('returns a promise', () => {
    const promises = [];

    [
      { args: ['-v'] },
      { args: ['-h'], error: 'Help' },
      { args: ['generate'] },
      { args: [], error: 'Invalid argument' },
      { args: ['unknown'], error: 'Unknown argument: unknown' },
      { args: ['-u'], error: 'Unknown argument: u' }
    ].forEach((options) => {
      mockYargs.reset();
      let promise = index.run(options.args, mockYargs);
      expect(promise instanceof Promise).toBe(true);

      if (options.error) {
        promise = promise.catch((err) => {
          expect(err.message).toBe(options.error);
        });
      }

      promises.push(promise);
    });

    return Promise.all(promises);
  });

  it('returns the promise of the given command', () => {
    const value = { command: true };
    mockGenerate.run.mockReturnValue(Promise.resolve(value));
    return index.run(['generate'], mockYargs).then((commandValue) => {
      expect(commandValue).toBe(value);
    });
  });
});
