'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.register(gulp, 'npmInstall', {
  dependencies: {
    uuid: '3.0.0',
    'left-pad': '1.1.0'
  }
});
