'use strict';

const gulp = require('gulp');
const tools = require('./src');

tools.initialize(gulp, {
  checkFileNames: true,

  eslint: true,

  jest: true,

  jscs: true,

  jsdoc: true,

  nsp: true,

  retire: true,

  webpack: false
});

gulp.task('default', ['pre-release']);
