'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'mocha', {
  require: path.join(__dirname, 'setup-file.js')
});
