'use strict';

const globals = require('../../index-globals');
const preprocessor = require('../../utils/helper-preprocessor');

module.exports = {
  process(src, filename) {
    const presets = [require.resolve('babel-preset-jest')].concat(globals.babel.presets);

    return preprocessor.processWithBabel(src, filename, Object.assign({}, globals.babel, {
      presets
    }));
  }
};
