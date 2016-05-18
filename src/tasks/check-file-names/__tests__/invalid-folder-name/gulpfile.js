'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'check-file-names', {
  paramCase: path.join(__dirname, '**')
});
