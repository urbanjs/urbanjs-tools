jest.dontMock('../index.js');
jest.dontMock('yargs');

const index = require('../index');
const yargs = require('yargs');
const mockGenerate = require('../generate');

describe('index command', () => {
  let mockYargs;

  beforeEach(() => {
    // kind of a real yargs...
    mockYargs = yargs();
    mockGenerate.run.mockClear();
  });

  it('shows help', () => {
    mockYargs.showHelp = jest.genMockFunction().mockReturnValue(mockYargs);

    // empty args
    index.run([], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(1);

    // unknown command given
    index.run(['unknown'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(2);

    // known command given
    index.run(['generate'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(2);
  });

  it('runs the generate task', () => {
    // mock showHelp not to log anything
    mockYargs.showHelp = jest.genMockFunction().mockReturnValue(mockYargs);

    index.run([], mockYargs);
    expect(mockGenerate.run.mock.calls.length).toBe(0);

    index.run(['generate'], mockYargs);
    expect(mockGenerate.run.mock.calls.length).toBe(1);
  });
});
