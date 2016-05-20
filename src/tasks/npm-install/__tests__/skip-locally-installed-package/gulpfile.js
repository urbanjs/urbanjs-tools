'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.register(gulp, 'npmInstall', {
  dependencies: {
    'node-uuid': '1.4.7',
    'left-pad': '1.1.0'
  }
});
