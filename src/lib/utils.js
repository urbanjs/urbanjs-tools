'use strict';

module.exports = {

  /**
   * Merges given configurations.
   *  - falsy value will be ignored
   *  - function will be called, it should return a valid configuration
   *  - a simple object will be merged
   *  - otherwise the new value will be used
   * @param {...*} configuration
   * @returns {Object|array}
   * @private
   */
  mergeParameters: function mergeParameters() {
    return Array.prototype.slice.call(arguments).reduce((result, configuration) => {
      if (!configuration || configuration === true) {
        return result;
      } else if (Array.isArray(configuration)) {
        return configuration;
      } else if (typeof configuration === 'object') {
        // using assign instead of deep merge
        // to be able to override values easily
        return Object.assign({}, result, configuration);
      } else if (typeof configuration === 'function') {
        return mergeParameters(result, configuration(result));
      }

      throw new Error('Invalid configuration: ' + JSON.stringify(configuration));
    }, {});
  }

};
