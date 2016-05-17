'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.register(gulp, 'check-dependencies', {
  files: path.join(__dirname, 'index.js'),
  packageFile: path.join(__dirname, 'package.json')
});
