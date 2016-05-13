'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.register(gulp, 'check-file-names', true, {
  sourceFiles: path.join(__dirname, '**')
});
