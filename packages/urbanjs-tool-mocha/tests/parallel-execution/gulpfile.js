'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.mocha.register(gulp, 'mocha', {
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
