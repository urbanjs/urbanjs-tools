'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.mocha.register(gulp, 'mocha', {
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
