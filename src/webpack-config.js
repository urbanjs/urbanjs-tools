'use strict';

const webpack = require('webpack');
const path = require('path');

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
    modulesDirectories: [path.join(__dirname, '../node_modules')],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      }
    ]
  }
};

module.exports = config;
