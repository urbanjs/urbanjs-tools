'use strict';

const path = require('path');

module.exports = {
  getTSLoader: (tsConfig, babelConfig) => [
    [
      require.resolve('babel-loader'),
      JSON.stringify(babelConfig)
    ].join('?'),

    // TODO: use query property of the loader
    // awesome-typescript-loader does not support to specify babel package path yet
    [
      require.resolve('awesome-typescript-loader'),
      JSON.stringify(Object.assign({
        compiler: 'typescript',
        tsconfig: path.join(__dirname, './tsconfig.json'),
        resolveGlobs: false
      }, tsConfig))
    ].join('?')
  ].join('!')
};
