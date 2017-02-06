'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'mocha', {
  files: 'index-test.js',
  coverageReporters: ['json'],
  coverageDirectory: 'dist'
});
