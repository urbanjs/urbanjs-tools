'use strict';

const gulp = require('gulp');
const tools = require('./src');

const unmockedModulePathPatterns = [
  'node_modules/.*',
  'lib/helper-tests.js'
];

tools.initialize(gulp, {
  checkDependencies: true,

  checkFileNames: defaults => {
    defaults.paramCase.push('!src/tasks/check-file-names/__tests__/**');
    return defaults;
  },

  eslint: {
    rules: {
      'global-require': 0
    }
  },

  jest: {
    testPathPattern: /.*-(test|spec)\.js$/,
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
