import * as expect from 'assert';
import {spy} from 'sinon';
import {DefaultCommand} from './index';
import {InvalidUsageError} from '../../errors';
import {config} from './config';

describe('cli', () => {
  describe('default command', () => {
    let defaultCommand;
    let cliServiceMock;
    let loggerServiceMock;
    let generateCommandMock;
    let cliVersion;

    beforeEach(() => {
      cliServiceMock = {
        parseArgs: spy(),
        showHelp: spy()
      };

      loggerServiceMock = {
        info: spy()
      };

      generateCommandMock = {
        run: spy()
      };

      cliVersion = '1.0.0';

      defaultCommand = new DefaultCommand(
        cliServiceMock,
        loggerServiceMock,
        generateCommandMock,
        cliVersion
      );
    });

    describe('.run', () => {
      it('returns a promise', () => {
        expect.equal(defaultCommand.run(['generate']) instanceof Promise, true);
      });

      context('when known command is given', () => {
        it('runs the command and returns its result', async () => {
          generateCommandMock.run = spy((values) => values);

          const rawArgs = ['generate', 1, 2, 3];
          const result = await defaultCommand.run(rawArgs);

          expect.equal(cliServiceMock.parseArgs.called, false);
          expect.equal(generateCommandMock.run.calledWith(rawArgs.slice(1)), true);
          expect.deepEqual(result, rawArgs.slice(1));
        });
      });

      context('when unknown command is given', () => {
        context('and help option is given', () => {
          it('it shows the help', async () => {
            cliServiceMock.parseArgs = spy(() => ({help: true}));

            const result = await defaultCommand.run([]);
            expect.equal(result, undefined);
            expect.equal(cliServiceMock.showHelp.calledWith(config), true);
          });
        });

        context('and version option is given', () => {
          it('it shows the cli version', async () => {
            cliServiceMock.parseArgs = spy(() => ({version: true}));

            const result = await defaultCommand.run([]);
            expect.equal(result, undefined);
            expect.equal(loggerServiceMock.info.calledWith(cliVersion), true);
          });
        });

        context('and unknown option is given', () => {
          it('throws', async () => {
            cliServiceMock.parseArgs = spy(() => ({unknown: true}));

            let result;
            try {
              result = await defaultCommand.run([]);
            } catch (e) {
              result = e;
            }

            expect.equal(result instanceof InvalidUsageError, true);
          });
        });

        context('and no option is given', () => {
          it('throws', async () => {
            cliServiceMock.parseArgs = spy(() => ({}));

            let result;
            try {
              result = await defaultCommand.run([]);
            } catch (e) {
              result = e;
            }

            expect.equal(result instanceof InvalidUsageError, true);
          });
        });
      });
    });
  });
});
