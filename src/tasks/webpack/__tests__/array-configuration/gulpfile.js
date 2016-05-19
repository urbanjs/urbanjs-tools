'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'webpack', [
  {
    entry: './index.js',
    output: {
      path: './dist',
      filename: 'index.js',
      libraryTarget: 'commonjs'
    }
  },
  {
    entry: './index.js',
    output: {
      path: './dist',
      filename: 'index2.js',
      libraryTarget: 'commonjs'
    }
  }
]);
