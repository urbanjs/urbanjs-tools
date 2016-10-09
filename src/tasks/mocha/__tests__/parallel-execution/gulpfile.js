'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'mocha', {
  files: [
    [
      'parallel-a-one.js',
      'parallel-a-two.js'
    ],
    [
      'parallel-b-one.js',
      'parallel-b-two.js'
    ]
  ]
});
