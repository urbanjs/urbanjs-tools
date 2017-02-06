'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(
  gulp,
  'check-dependencies',
  { packageFile: path.join(__dirname, 'package.json') },
  { sourceFiles: path.join(__dirname, 'index.js') }
);
