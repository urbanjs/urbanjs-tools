'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'tslint', true, {
  sourceFiles: 'index-invalid.ts'
});
