'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'webpack', {
  entry: './index.js',
  output: {
    path: './dist',
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: require.resolve('babel-loader')
    }]
  }
});
