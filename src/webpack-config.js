'use strict';

const webpack = require('webpack');
const path = require('path');
const globals = require('./index-globals');
const processCwd = process.cwd();

const config = {
  target: 'node',
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },

  stats: {
    colors: true,
    timings: true
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
        loader: 'babel',
        get query() {
          return globals.babel;
        }
      }
    ]
  }
};

module.exports = config;
