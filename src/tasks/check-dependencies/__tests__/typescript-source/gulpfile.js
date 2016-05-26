'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'check-dependencies', {
  files: path.join(__dirname, 'index.ts'),
  packageFile: path.join(__dirname, 'package.json')
});
