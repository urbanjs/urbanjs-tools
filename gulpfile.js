'use strict';

const gulp = require('gulp');
const tools = require('./src');

tools.initialize(gulp, {
  checkDependencies: true,

  checkFileNames: true,

  eslint: true,

  jest: {
    unmockedModulePathPatterns: ['node_modules/.*']
  },

  jscs: true,

  jsdoc: true,

  nsp: true,

  retire: true,

  webpack: false
});

gulp.task('default', ['pre-release']);
