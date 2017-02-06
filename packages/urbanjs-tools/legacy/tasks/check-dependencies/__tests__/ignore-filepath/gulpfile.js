'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'check-dependencies', {
  packageFile: path.join(__dirname, 'package.json'),
  files: [
    `${path.join(__dirname, '**/*')}`,
    `!${path.join(__dirname, 'gulpfile.js')}`
  ]
});
