'use strict';

const _ = require('lodash');
const yargsHelper = require('../utils/helper-yargs');

function isObject(obj) {
  return typeof obj === 'object'
    && obj instanceof Object
    && !(obj instanceof Array);
}

function isValidConfig(obj) {
  return isObject(obj) || Array.isArray(obj);
}

function getProcessOptions(prefix) {
  const yargs = yargsHelper.initYargs();

  try {
    return yargs.parse(process.argv.slice(2))[prefix] || {};
  } catch (e) {
    return {};
  }
}

module.exports = {

  getFileExtensionRegExp(extensions) {
    return new RegExp(`(${extensions.map(extension => extension.replace('.', '\\.')).join('|')})$`);
  },

  /**
   * Merges given configuration with defaults.
   *  - falsy value will be ignored
   *  - function will be called, it should return a valid configuration
   *  - a simple object will be merged
   *  - otherwise the new value will be used
   * @param {Object} defaults
   * @param {*} configuration
   * @param {string} [processOptionPrefix]
   * @returns {Object|Array}
   * @private
   */
  mergeParameters(defaults, configuration, processOptionPrefix) {
    if (!isObject(defaults)) {
      throw new Error(`Invalid arguments: defaults must be an object ${JSON.stringify(defaults)}`);
    }

    let result;
    if (!configuration || configuration === true) {
      result = defaults;
    } else if (Array.isArray(configuration)) {
      result = configuration;
    } else if (isObject(configuration)) {
      // using assign instead of deep merge
      // to be able to override values easily
      result = Object.assign({}, defaults, configuration);
    } else if (typeof configuration === 'function') {
      result = configuration(_.cloneDeep(defaults));
      if (!isValidConfig(result)) {
        throw new Error(`Invalid config: ${JSON.stringify(result)}`);
      }
    } else {
      throw new Error(`Invalid arguments: invalid config ${JSON.stringify(configuration)}`);
    }

    if (processOptionPrefix && isObject(result)) {
      result = _.merge(_.cloneDeep(result), getProcessOptions(processOptionPrefix));
    }

    return result;
  },

  notAvailableGulpTask(taskName) {
    return (done) => {
      console.log(// eslint-disable-line no-console
        `${taskName} is not available anymore. See changelog for further information.`);
      done(null);
    };
  }

};
