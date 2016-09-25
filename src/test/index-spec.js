'use strict';

import { equal } from 'assert';
import { setGlobalConfiguration } from '../index';
import globals from '../index-globals';

describe('Public interface', () => {
  const originalBabelConfig = globals.babel;

  afterEach(() => {
    globals.babel = originalBabelConfig;
  });

  describe('.setGlobalConfiguration() api', () => {
    it('should update the global configuration', () => {
      equal(typeof globals.babel, 'object');

      setGlobalConfiguration({
        babel: undefined
      });

      equal(typeof globals.babel, 'undefined');
    });

    it('should fail if unknown global configuration is given', () => {
      let err;

      try {
        setGlobalConfiguration({
          unknown: true
        });
      } catch (e) {
        err = e;
      }

      equal(err && err.message, 'Unknown globals: unknown');
    });

    it('should accept method as configuration', () => {
      setGlobalConfiguration(currentGlobals => {
        equal(typeof currentGlobals, 'object');
        equal(typeof currentGlobals.babel, 'object');

        currentGlobals.babel = undefined;// eslint-disable-line no-param-reassign
        return currentGlobals;
      });

      equal(typeof globals.babel, 'undefined');
    });

    it('should not allow to modify the reference of the globals in the config method', () => {
      setGlobalConfiguration(currentGlobals => {
        equal(typeof currentGlobals, 'object');
        equal(typeof currentGlobals.babel, 'object');

        const currentCopy = Object.assign({}, currentGlobals);

        currentGlobals.unknown = true; // eslint-disable-line no-param-reassign

        return currentCopy;
      });

      equal(typeof globals.unknown, 'undefined');
    });

    it('should fail if configuration method does not return an valid object', () => {
      let err;

      try {
        setGlobalConfiguration(() => null);
      } catch (e) {
        err = e;
      }

      equal(err.message, 'Invalid config: null');
    });
  });
});
