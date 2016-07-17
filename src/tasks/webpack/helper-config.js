'use strict';

const path = require('path');

module.exports = {
  getTSLoader: (tsConfig, babelConfig) =>
    Object.assign({
      tsconfig: path.join(__dirname, './tsconfig.json'),
      useBabel: true,
      babelCore: require.resolve('babel-core'),
      babelOptions: babelConfig
    }, tsConfig)
};
