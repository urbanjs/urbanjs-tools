'use strict';

jest.dontMock('../index.js');
jest.dontMock('yargs');

const index = require('../index');
const mockGenerate = require('../generate');
const yargs = require('yargs');

describe('CLI - index command', () => {
  let mockYargs;

  beforeEach(() => {
    // kind of a real yargs...
    mockYargs = yargs.reset();
    mockGenerate.run.mockClear();
    mockGenerate.run.mockReturnValue(Promise.resolve());
  });

  it('accepts options yargs instance as second arguments', () => {
    expect(() => {
      index.run([]);
    }).not.toThrow();

    mockYargs.showHelp = jest.genMockFunction().mockReturnValue(mockYargs);
    index.run([], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(1);
  });

  it('shows help if empty or unknown command/option is given', () => {
    mockYargs.showHelp = jest.genMockFunction().mockReturnValue(mockYargs);

    // empty args
    index.run([], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(1);

    // unknown command given
    mockYargs.reset();
    index.run(['unknown'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(2);

    // unknown option given
    mockYargs.reset();
    index.run(['-uo'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(3);

    // known command given, help is not needed
    mockYargs.reset();
    index.run(['generate'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(3);

    // known command but invalid options are given
    // command should take care of it
    mockYargs.reset();
    index.run(['generate', '-e'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(3);
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
      { args: ['-h'] },
      { args: ['generate'] },
      { args: [], error: 'Invalid argument' },
      { args: ['unknown'], error: 'Invalid argument' },
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

  it('returns the promise of the given command', () => {
    const promise = Promise.resolve();
    mockGenerate.run.mockReturnValue(promise);
    expect(index.run(['generate'], mockYargs)).toBe(promise);
  });
});
