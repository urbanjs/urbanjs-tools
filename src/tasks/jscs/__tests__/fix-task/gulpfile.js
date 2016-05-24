'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'jscs', {
  files: 'index-invalid.js'
});
