'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'mocha', {
  files: [
    'index-test.js',
    ['parallel-one-test.js'],
    ['parallel-two-test.js']
  ],
  coverageReporters: ['text-summary'],
  coverageFrom: 'index.js'
});
