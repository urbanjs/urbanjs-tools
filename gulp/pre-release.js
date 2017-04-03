'use strict';

const gulp = require('gulp');
const path = require('path');
const readdir = require('readdir');
const tools = require('urbanjs-tools');
const tsCompilerOptions = require('../packages/urbanjs-tools/tsconfig.json').compilerOptions;

tools.setGlobalConfiguration(defaults => Object.assign(defaults, {
  typescript: tsCompilerOptions
}));

tools.initializeTasks(gulp, {
  babel: {
    files: [
      'src/**/*.+(js|ts|tsx|txt)',
      '!src/tests/**',
      '!src/**/*-tests.ts'
    ]
  },

  checkDependencies: true,

  checkFileNames: true,

  mocha: defaults => Object.assign({}, defaults, {
    files: ['src/**/*-tests.ts'],
    require: [
      defaults.require,
      path.join(__dirname, 'mocha-environment.js')
    ],
    collectCoverage: false
  }),

  tslint: {
    configFile: '../../tslint.json'
  }
});

tools.tasks.babel.register(gulp, 'babel:dev', true, { typescript: tsCompilerOptions });

tools.tasks.mocha.register(gulp, 'test-e2e', defaults => Object.assign({}, defaults, {
  files: readdir.readSync(
    'tests',
    ['*-tests.ts'],
    readdir.ABSOLUTE_PATHS
  ).map(file => [file]),
  require: [
    defaults.require,
    path.join(__dirname, 'mocha-environment.js')
  ],
  collectCoverage: false,
  timeout: 50000
}));

tools.initializePresets(gulp, {
  dist: true,
  test: true,
  analyze: true,
  'pre-commit': true,
  'pre-release': defaults => defaults.concat('test-e2e')
});
