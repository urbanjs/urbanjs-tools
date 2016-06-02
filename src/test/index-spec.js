'use strict';

import { setGlobalConfiguration } from '../index';
import globals from '../index-globals';
import { equal } from 'assert';

describe('Public interface', () => {
  describe('.setGlobalConfiguration() api', () => {
    it('should update the global configuration', () => {
      equal(globals.allowLinking, true);

      setGlobalConfiguration({
        allowLinking: false
      });

      equal(globals.allowLinking, false);
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
        equal(currentGlobals.allowLinking, false);

        return currentGlobals;
      });
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
