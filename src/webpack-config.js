'use strict';

const webpack = require('webpack');
const path = require('path');
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
    ],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: 'babel',
        query: {
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-react')
          ],
          plugins: [

            // legacy decorator plugin (this must be the first plugin)
            require.resolve('babel-plugin-transform-decorators-legacy'),

            // stage-0
            require.resolve('babel-plugin-transform-do-expressions'),
            require.resolve('babel-plugin-transform-function-bind'),

            // stage-1 without the decorator plugin
            require.resolve('babel-plugin-transform-class-constructor-call'),
            require.resolve('babel-plugin-transform-class-properties'),
            require.resolve('babel-plugin-transform-export-extensions'),

            // stage-2
            require.resolve('babel-plugin-syntax-trailing-function-commas'),
            require.resolve('babel-plugin-transform-object-rest-spread'),

            // stage-3
            require.resolve('babel-plugin-transform-async-to-generator'),
            require.resolve('babel-plugin-transform-exponentiation-operator'),
          ]
        }
      }
    ]
  }
};

module.exports = config;
