'use strict';
const gulp = require('gulp');
const tools = require('./src');

tools.initialize(gulp);

gulp.task('default', ['pre-release']);
