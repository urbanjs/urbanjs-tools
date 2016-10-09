'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'mocha', {
  files: 'index-test.js',
  coverageFrom: 'index.js',
  coverageThresholds: {
    global: {
      statements: 100,
      branches: 90,
      lines: 70,
      functions: -10
    }
  }
});
