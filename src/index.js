'use strict';

const path = require('path');
const merge = require('lodash.merge');
const webpackConfig = require('./webpack-config.js');

const taskCheckFileNames = require('./check-file-names');
const taskESLint = require('./eslint');
const taskJest = require('./jest');
const taskJSCS = require('./jscs');
const taskJSDoc = require('./jsdoc');
const taskNSP = require('./nsp');
const taskWebpack = require('./webpack');

/**
 * @module main
 */
module.exports = {

  /**
   * @type {Object}
   * @property {module:tasks/checkFileNames} checkFileNames
   * @property {module:tasks/eslint} eslint
   * @property {module:tasks/jest} jest
   * @property {module:tasks/jscs} jscs
   * @property {module:tasks/jsdoc} jsdoc
   * @property {module:tasks/nsp} nsp
   * @property {module:tasks/webpack} webpack
   */
  tasks: {
    checkFileNames: taskCheckFileNames,
    eslint: taskESLint,
    jest: taskJest,
    jscs: taskJSCS,
    jsdoc: taskJSDoc,
    nsp: taskNSP,
    webpack: taskWebpack
  },

  /**
   * TODO: configuration support
   * Initializes the gulp with the common tasks.
   * @param {external:Gulp} gulp
   */
  initialize(gulp) {
    const processCwd = process.cwd();
    const files = {
      bin: [
        processCwd + '/bin/**/*.js'
      ],
      gulp: [
        processCwd + '/gulp/**/*.js'
      ],
      source: [
        processCwd + '/src/**/*.js'
      ]
    };
    const allFiles = Array.prototype.concat.apply([], Object.keys(files).map((key) => {
      return files[key];
    }));
    const jsDocConfigPath = path.join(__dirname, '../.jsdocrc');
    const jsDocExecutablePath = path.join(__dirname, '../node_modules/.bin/');
    const nspPackageFiles = processCwd + '/package.json';
    const JSCSConfigFile = path.join(__dirname, '../.jscsrc');
    const ESLintConfigFile = path.join(__dirname, '../.eslintrc');
    const jestConfig = {
      // TODO: fix coverage
      // if testPathDirs are given, coverage will be empty
      // collectCoverage: true

      setupEnvScriptFile: path.join(__dirname, './jest-set-env-script.js'),
      scriptPreprocessor: path.join(__dirname, './jest-preprocessor.js'),
      unmockedModulePathPatterns: ['core-js/.*'],
      rootDir: processCwd,
      testPathDirs: [
        path.join(processCwd, 'src')
      ]
    };
    const webpackRootFile = path.join(processCwd, 'src/index.js');
    const webpackBuildPath = path.join(processCwd, 'dist');

    taskCheckFileNames.register(gulp, {
      paramCase: allFiles
    });

    taskJSDoc.register(gulp, {
      configFile: jsDocConfigPath,
      executablePath: jsDocExecutablePath
    });

    taskNSP.register(gulp, {
      packageFile: nspPackageFiles
    });

    taskJSCS.register(gulp, {
      files: allFiles,
      configFile: JSCSConfigFile,
      esnext: true
    });

    taskESLint.register(gulp, {
      files: allFiles,
      configFile: ESLintConfigFile
    });

    taskWebpack.register(gulp, merge({}, {
      entry: [require.resolve('babel-polyfill'), webpackRootFile],
      output: {
        path: webpackBuildPath,
        filename: 'index.js',
        libraryTarget: 'commonjs2'
      }
    }, webpackConfig));

    taskJest.register(gulp, jestConfig);

    // Create presets

    gulp.task('dist', ['webpack']);

    gulp.task('doc', ['jsdoc']);

    gulp.task('test', ['jest']);

    gulp.task('analyse', ['check-file-names', 'jscs', 'eslint', 'nsp']);

    gulp.task('pre-commit', ['analyse', 'test']);

    gulp.task('pre-release', ['pre-commit', 'dist', 'doc']);
  }

};
