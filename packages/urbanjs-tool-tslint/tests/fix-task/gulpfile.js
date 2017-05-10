'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks.tslint.register(gulp, 'tslint', {
  files: 'index-invalid.ts'
});
