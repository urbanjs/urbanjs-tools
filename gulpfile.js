'use strict';

const gulp = require('gulp');
const tools = require('./src');
const globalSourceFiles = require('./src/utils/global-source-files');

const unmockedModulePathPatterns = [
  'node_modules/.*',
  'utils/helper-tests.js'
];

tools.setGlobalConfiguration({
  sourceFiles: globalSourceFiles.concat(
    '!**/dist/**',
    '!**/help/**',
    '!**/coverage/**'
  )
});

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
      '/jest/__tests__/.+/'
    ]
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
