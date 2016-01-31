'use strict';

const path = require('path');
const webpack = require('webpack');

const processCwd = process.cwd();
const config = {
  entry: [
    require.resolve('babel-polyfill'),
    path.join(processCwd, 'src/index.js')
  ],

  output: {
    path: path.join(processCwd, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd'
  },

  target: 'node',

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
    modulesDirectories: [
      path.join(processCwd, 'node_modules'),
      path.join(__dirname, '../node_modules')
    ]
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: require.resolve('babel-loader'),
        query: require('./lib/global-babel')
      },
      {
        test: /\.json$/,
        loader: require.resolve('json-loader')
      }
    ]
  }
};

module.exports = {
  watch: false,
  config
};
