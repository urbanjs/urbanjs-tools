'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('@tamasmagedli/urbanjs-tools');

const processCwd = process.cwd();

tools.tasks.webpack.register(gulp, 'webpack', [
  {
    entry: './index.js',
    output: {
      path: path.join(processCwd, './dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs'
    }
  },
  {
    entry: './index.js',
    output: {
      path: path.join(processCwd, './dist'),
      filename: 'index2.js',
      libraryTarget: 'commonjs'
    }
  }
]);
