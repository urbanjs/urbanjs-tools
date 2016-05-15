'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.register(gulp, 'retire', {
  packagePath: path.join(require.resolve('retire'), '../../')
});
