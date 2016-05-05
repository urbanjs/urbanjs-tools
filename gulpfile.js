'use strict';

const gulp = require('gulp');
const tools = require('./src');

const unmockedModulePathPatterns = ['node_modules/.*'];

tools.initialize(gulp, {
  checkDependencies: true,

  checkFileNames: true,

  eslint: {
    rules: {
      'global-require': 0
    }
  },

  jest: {
    unmockedModulePathPatterns
  },

  jscs: true,

  jsdoc: true,

  nsp: true,

  retire: true
});

tools.tasks.jest.register(gulp, 'test-unit', {
  unmockedModulePathPatterns,
  testPathPattern: /.*-spec\.js$/
});

gulp.task('default', ['pre-release']);
