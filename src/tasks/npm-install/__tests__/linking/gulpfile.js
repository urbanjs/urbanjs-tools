'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.register(gulp, 'npmInstall', {
  link: true,
  dependencies: {
    uuid: '3.0.0'
  }
});
