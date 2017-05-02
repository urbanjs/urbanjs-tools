import * as expect from 'assert';
import {spy} from 'sinon';
import * as index from './index';
import {container} from './container';
import {ICommand, TYPE_COMMAND_DEFAULT} from './types';
import {InvalidUsageError} from './errors';
import {ILoggerService, TYPE_SERVICE_LOGGER} from 'urbanjs-tools-core';

describe('index', () => {
  beforeEach(() => {
    container.snapshot();
  });

  afterEach(() => {
    container.restore();
  });

  it('exposes only the .run method', () => {
    expect.deepEqual(Object.keys(index), ['run']);
  });

  describe('.run', () => {
    it('proxies defaultCommand.run', () => {
      const defaultCommandMock = {run: spy()};
      container.rebind<ICommand>(TYPE_COMMAND_DEFAULT).toConstantValue(defaultCommandMock);

      const args = [];
      index.run(args);

      expect.equal(defaultCommandMock.run.calledWith(args), true);
    });

    context('when default command fails', () => {
      let defaultCommandMock;
      let loggerServiceMock;

      beforeEach(() => {
        defaultCommandMock = {run: spy()};
        loggerServiceMock = {error: spy()};

        container.rebind<ICommand>(TYPE_COMMAND_DEFAULT).toConstantValue(defaultCommandMock);
        container.rebind<ILoggerService>(TYPE_SERVICE_LOGGER).toConstantValue(loggerServiceMock);
      });

      context('with unexpected error', () => {
        let error;
        beforeEach(() => {
          error = new Error('unexpected');
          defaultCommandMock.run = spy(() => {
            throw error;
          });
        });

        it('it throws and shows the unexpected error', async () => {
          let result;
          try {
            result = await index.run([]);
          } catch (e) {
            result = e;
          }

          expect.equal(result instanceof Error, true);
          expect.equal(result.message, 'unexpected');
          expect.equal(loggerServiceMock.error.calledWith('Unexpected error', error), true);
        });
      });

      context('with known error', () => {
        let error;
        beforeEach(() => {
          error = new InvalidUsageError();
          defaultCommandMock.run = spy(() => {
            throw error;
          });
        });

        it('it throws and shows the message how to use the cli properly', async () => {
          let result;
          try {
            result = await index.run([]);
          } catch (e) {
            result = e;
          }

          expect.equal(result instanceof InvalidUsageError, true);
          expect.equal(loggerServiceMock.error.calledWith('Invalid usage of urbanjs cli. Please use --help.'), true);
        });
      });
    });
  });
});
