'use strict';

const gulp = require('gulp');
const tools = require('./src');

tools.initialize(gulp, {
  webpack: false
});

gulp.task('default', ['pre-release']);
