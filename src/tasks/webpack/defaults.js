'use strict';

const path = require('path');
const processCwd = process.cwd();
const webpack = require('webpack');

module.exports = {
  entry: path.join(processCwd, 'src'),

  output: {
    path: path.join(processCwd, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd'
  },

  target: 'node',
  bail: true,
  devtool: 'source-map',

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
      path.join(__dirname, '../../../node_modules'),
      path.join(processCwd, 'node_modules')
    ]
  },

  externals: [
    /^[a-z\-0-9].+$/
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: require.resolve('babel-loader'),
        query: require('../../lib/global-babel')
      },
      {
        test: /\.json$/,
        loader: require.resolve('json-loader')
      }
    ]
  }
};
