'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'eslint', true, {
  sourceFiles: 'index-invalid.js'
});
