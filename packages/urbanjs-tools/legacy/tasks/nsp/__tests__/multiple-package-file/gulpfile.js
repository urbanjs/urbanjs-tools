'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'nsp', {
  packageFile: [
    path.join(__dirname, 'package.json'),
    path.join(__dirname, 'package2.json')
  ]
});
