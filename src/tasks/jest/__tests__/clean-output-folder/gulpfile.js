'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'jest', {
  rootDir: __dirname,
  coverageDirectory: 'dist'
});
