'use strict';

import config from './helper-config';

jest.unmock('../helper-config');

describe('Config helper', () => {
  describe('.mergeParameters()', () => {
    it('should return defaults if configuration is falsy or true', () => {
      const defaults = { a: 1 };

      [
        0,
        '',
        false,
        null,
        undefined,
        NaN,
        true
      ].forEach((configuration) => {
        expect(config.mergeParameters.call(config, defaults, configuration)).toEqual(defaults);
      });
    });

    it('should return the given configuration if it is an array', () => {
      expect(config.mergeParameters({ a: 1, b: 2 }, [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should merge the given configuration if it is an object', () => {
      expect(config.mergeParameters({ a: 1, b: 2 }, { a: 2 })).toEqual({ a: 2, b: 2 });
    });

    it('should not merge the given configuration if it was a function', () => {
      const returnValue = { a: 2 };
      expect(config.mergeParameters({ a: 1, b: 2 }, () => returnValue)).toEqual(returnValue);
    });

    it('should get the defaults in the configuration function', () => {
      const defaults = { a: 2 };
      expect(config.mergeParameters(defaults, _defaults => _defaults)).toEqual(defaults);
    });

    it('should not allow to modify the defaults in the configuration function accidentally', () => {
      const defaults = { a: 2 };

      expect(config.mergeParameters(defaults, _defaults => _defaults)).not.toBe(defaults);
      expect(config.mergeParameters(defaults, (_defaults) => {
        _defaults.b = 1; // eslint-disable-line no-param-reassign
        return _defaults;
      })).toEqual({ a: 2, b: 1 });
      expect(defaults).toEqual({ a: 2 });
    });

    it('should validate arguments', () => {
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
        () => {
        }
      ].forEach((defaults) => {
        expect(() => config.mergeParameters.call(config, defaults, {})).toThrow(
          new Error(`Invalid arguments: defaults must be an object ${JSON.stringify(defaults)}`)
        );
      });

      [
        'notempty',
        1
      ].forEach((configuration) => {
        expect(() => config.mergeParameters.call(config, {}, configuration)).toThrow(
          new Error(`Invalid arguments: invalid config ${JSON.stringify(configuration)}`)
        );
      });
    });

    it('should validate the config returned by the config function', () => {
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
        () => {
        }
      ].forEach((returnValue) => {
        const msg = `Invalid config: ${JSON.stringify(returnValue)}`;
        expect(() => config.mergeParameters.call(config, {}, () => returnValue))
          .toThrow(new Error(msg));
      });
    });
  });
});
