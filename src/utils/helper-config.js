'use strict';

const _ = require('lodash');

function isObject(obj) {
  return typeof obj === 'object'
    && obj instanceof Object
    && !(obj instanceof Array);
}

function isValidConfig(obj) {
  return isObject(obj) || Array.isArray(obj);
}

module.exports = {

  /**
   * Merges given configuration with defaults.
   *  - falsy value will be ignored
   *  - function will be called, it should return a valid configuration
   *  - a simple object will be merged
   *  - otherwise the new value will be used
   * @param {Object} defaults
   * @param {*} configuration
   * @returns {Object|Array}
   * @private
   */
  mergeParameters: function mergeParameters(defaults, configuration) {
    if (!isObject(defaults)) {
      throw new Error(`Invalid arguments: defaults must be an object ${JSON.stringify(defaults)}`);
    }

    if (!configuration || configuration === true) {
      return defaults;
    } else if (Array.isArray(configuration)) {
      return configuration;
    } else if (isObject(configuration)) {
      // using assign instead of deep merge
      // to be able to override values easily
      return Object.assign({}, defaults, configuration);
    } else if (typeof configuration === 'function') {
      const result = configuration(_.cloneDeep(defaults));
      if (!isValidConfig(result)) {
        throw new Error(`Invalid config: ${JSON.stringify(result)}`);
      }

      return result;
    }

    throw new Error(`Invalid arguments: invalid config ${JSON.stringify(configuration)}`);
  }

};
