'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.register(gulp, 'npmInstall', {
  dependencies: {
    'left-pad': '1.1.0'
  }
});
