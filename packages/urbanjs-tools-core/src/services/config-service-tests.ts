import {spy} from 'sinon';
import * as expect from 'assert';
import {ConfigService} from './config-service';

describe('config service', () => {
  let configService;
  let loggerServiceMock;
  let cliServiceMock;
  let traceServiceMock;

  beforeEach(() => {
    loggerServiceMock = {
      error: spy()
    };

    cliServiceMock = {
      parseArgs: spy()
    };

    traceServiceMock = {
      track: spy()
    };

    configService = new ConfigService(loggerServiceMock, cliServiceMock, traceServiceMock);
  });

  describe('.mergeParameters()', () => {
    context('when parameters is true', () => {
      it('returns defaults', () => {
        const defaults = {a: 1};
        expect.equal(configService.mergeParameters(defaults, true), defaults);
      });
    });

    context('when parameters is an array', () => {
      it('merges all items with the defaults', () => {
        const defaults = {a: 1, b: 2};
        const parameters = [{a: 0}, {b: 0}];
        const result = configService.mergeParameters(defaults, parameters);
        expect.deepEqual(result, [{a: 0, b: 2}, {a: 1, b: 0}]);
      });
    });

    context('when parameters is an object', () => {
      it('merges the given configuration', () => {
        const defaults = {a: 1, b: 2};
        const parameters = {a: 2};
        const result = configService.mergeParameters(defaults, parameters);
        expect.deepEqual(result, {a: 2, b: 2});
      });
    });

    context('when parameters is a function', () => {
      it('does not merge the given configuration', () => {
        const defaults = {a: 1, b: 2};
        const finalParameters = {a: 2};
        const parameters = () => finalParameters;
        const result = configService.mergeParameters(defaults, parameters);
        expect.deepEqual(result, finalParameters);
      });

      it('gets the defaults', () => {
        const defaults = {};
        const parameters = spy(() => ({}));
        configService.mergeParameters(defaults, parameters);
        expect.equal(parameters.calledWith(defaults), true);
      });

      it('does not allow to modify the defaults', () => {
        const defaults = {a: 2};
        const parameters = spy(d => {
          d.a = 3;
          return d;
        });

        expect.deepEqual(configService.mergeParameters(defaults, parameters), {a: 3});
        expect.deepEqual(configService.mergeParameters(defaults, parameters), {a: 3});
      });
    });

    it('validates arguments', () => {
      [
        undefined,
        null,
        true,
        false,
        NaN,
        1,
        0,
        [],
        '',
        'notempty',
        () => { //tslint:disable-line
        }
      ].forEach((defaults) => {
        expect.throws(
          () => configService.mergeParameters(defaults, {}),
          /Invalid arguments/
        );

        expect.equal(loggerServiceMock.error.calledWith(`Invalid arguments: defaults must be an object ${JSON.stringify(defaults)}`), true);
      });

      [
        'notempty',
        1,
        0,
        '',
        false,
        null,
        undefined,
        NaN
      ].forEach((configuration) => {
        expect.throws(
          () => configService.mergeParameters({}, configuration),
          /Invalid arguments/
        );
        expect.equal(loggerServiceMock.error.calledWith(`Invalid arguments: invalid parameters ${JSON.stringify(configuration)}`), true);
      });
    });

    it('validates the config returned by the config function', () => {
      [
        undefined,
        null,
        true,
        false,
        NaN,
        1,
        0,
        '',
        'notempty',
        () => { //tslint:disable-line
        }
      ].forEach((returnValue) => {
        expect.throws(
          () => configService.mergeParameters({}, () => returnValue),
          /Invalid config/
        );

        expect.equal(loggerServiceMock.error.calledWith(`Invalid result from config function: ${JSON.stringify(returnValue)}`), true);
      });
    });
  });

  describe('.setGlobalConfiguration()', () => {
    it('updates the global configuration', () => {
      const globals = configService.getGlobalConfiguration();
      const updatedGlobals = {
        ...globals,
        babel: undefined
      };

      configService.setGlobalConfiguration(updatedGlobals);

      expect.deepEqual(configService.getGlobalConfiguration(), updatedGlobals);
    });

    it('uses .mergeParameters()', () => {
      configService.mergeParameters = spy(() => ({}));

      const currentGlobals = configService.getGlobalConfiguration();
      const globals = {babel: true};

      configService.setGlobalConfiguration(globals);
      expect.equal(configService.mergeParameters.calledWith(currentGlobals, globals, 'global'), true);
    });

    it('updates urbanJSToolGlobals environment variable', () => {
      const globals = configService.getGlobalConfiguration();
      const updatedGlobals = {
        ...globals,
        babel: undefined
      };

      configService.setGlobalConfiguration(updatedGlobals);

      expect.equal(JSON.stringify(updatedGlobals), process.env.urbanJSToolGlobals);
    });

    context('when unknown key is given', () => {
      it('throws', () => {
        let result;

        try {
          result = configService.setGlobalConfiguration({
            unknown: true
          });
        } catch (e) {
          result = e;
        }

        expect.equal(result instanceof Error, true);
        expect.equal(loggerServiceMock.error.calledWith('Unknown globals: unknown'), true);
      });
    });
  });
});
