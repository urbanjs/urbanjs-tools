'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'babel', {
  babel: {
    presets: [require.resolve('babel-preset-es2015')]
  },
  files: path.join(__dirname, 'index.js'),
  outputPath: path.join(__dirname, 'dist'),
  sourcemap: {}
});
