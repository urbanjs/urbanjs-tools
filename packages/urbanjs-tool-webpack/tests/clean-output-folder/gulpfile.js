'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.webpack.register(gulp, 'webpack', {
  entry: './index.js',
  output: {
    path: path.join(process.cwd(), './dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{ loader: require.resolve('babel-loader') }]
    }]
  }
});
