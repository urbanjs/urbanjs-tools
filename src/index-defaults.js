'use strict';

const path = require('path');
const webpackConfig = require('./webpack-config.js');

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

module.exports = {
  checkFileNames: {
    paramCase: allFiles
  },
  jsdoc: {
    configFile: jsDocConfigPath,
    executablePath: jsDocExecutablePath
  },
  nsp: {
    packageFile: nspPackageFiles
  },
  jest: jestConfig,
  jscs: {
    files: allFiles,
    configFile: JSCSConfigFile,
    esnext: true
  },
  eslint: {
    files: allFiles,
    configFile: ESLintConfigFile
  },
  webpack: {
    watch: false,
    config: Object.assign({}, {
      entry: [require.resolve('babel-polyfill'), webpackRootFile],
      output: {
        path: webpackBuildPath,
        filename: 'index.js',
        libraryTarget: 'umd'
      }
    }, webpackConfig)
  }
};
