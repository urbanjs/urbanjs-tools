'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');
const tsCompilerOptions = require('../tsconfig.json').compilerOptions;

tools.setGlobalConfiguration(defaults => Object.assign(defaults, {
  typescript: tsCompilerOptions
}));

tools.initializeTasks(gulp, {
  babel: {
    files: 'src/**/*.+(js|ts|tsx|txt)'
  },

  checkDependencies: true,

  checkFileNames: true,

  mocha: {
    collectCoverage: false
  },

  tslint: {
    configFile: '../../tslint.json'
  }
});

tools.initializePresets(gulp, {
  dist: true,
  test: true,
  analyze: true,
  'pre-commit': true,
  'pre-release': true
});
