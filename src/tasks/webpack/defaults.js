'use strict';

const path = require('path');
const processCwd = process.cwd();
const webpack = require('webpack');

module.exports = {
  entry: path.join(processCwd, 'src'),

  output: {
    path: path.join(processCwd, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },

  target: 'node',
  bail: true, // quit after the first error
  devtool: 'source-map', // generate production supported source map

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ],

  resolveLoader: {
    modulesDirectories: [// used loaders might have dependencies installed only in urbanjs
      path.join(processCwd, 'node_modules/urbanjs-tools/node_modules'),
      path.join(processCwd, 'node_modules')
    ]
  },

  externals: [
    /^[a-z\-0-9].+$/ // global & npm packages are handled as externals
  ],

  module: {
    loaders: [
      {
        test: /[^.min]\.js$/, // minified files are ignored
        exclude: /(node_modules|bower_components|vendor|dist)/,
        loader: require.resolve('babel-loader'),
        query: require('../../utils/global-babel')
      },
      {
        test: /\.json$/,
        loader: require.resolve('json-loader')
      }
    ]
  }
};
