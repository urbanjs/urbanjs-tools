'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'babel', {
  files: path.join(__dirname, 'index.js'),
  outputPath: path.join(__dirname, 'dist'),
  sourcemap: false
});
