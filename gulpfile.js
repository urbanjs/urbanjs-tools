'use strict';

const gulp = require('gulp');
const tools = require('./src');

const unmockedModulePathPatterns = [
  'node_modules/.*',
  'utils/helper-tests.js'
];

tools.setGlobalConfiguration(defaults => ({
  sourceFiles: defaults.sourceFiles.concat(
    '!**/dist/**',
    '!**/help/**',
    '!**/coverage/**',
    '!**/__tests__/**/*-invalid.+(js|jsx)'
  )
}));

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
    unmockedModulePathPatterns,
    collectCoverage: false,
    testPathIgnorePatterns: [
      '/node_modules/',
      '/jest/__tests__/.+/',
      '/mocha/__tests__/.+/'
    ]
  },

  jscs: true,

  jsdoc: true,

  mocha: true,

  nsp: true,

  retire: true
});

gulp.task('default', ['pre-release']);
