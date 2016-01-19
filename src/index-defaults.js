'use strict';

const path = require('path');
const readdir = require('readdir');
const webpackConfig = require('./webpack-config.js');
const processCwd = process.cwd();
const sourceFiles = [
  path.join(processCwd, 'bin/**/*.js'),
  path.join(processCwd, 'src/**/*.js'),
  path.join(processCwd, 'gulp/**/*.js'),
  path.join(processCwd, 'gulpfile.js')
];

module.exports = {
  checkFileNames: {
    paramCase: sourceFiles
  },

  jsdoc: {
    configFile: path.join(__dirname, '../.jsdocrc'),
    executablePath: path.join(require.resolve('jsdoc/jsdoc'), '../../.bin/')
  },

  nsp: {
    packageFile: path.join(processCwd, 'package.json')
  },

  jest: {
    rootDir: processCwd,
    unmockedModulePathPatterns: ['core-js/.*'],
    setupEnvScriptFile: path.join(__dirname, 'jest-set-env-script.js'),
    scriptPreprocessor: path.join(__dirname, 'jest-preprocessor.js'),
    collectCoverage: true,
    collectCoverageOnlyFrom: readdir
      .readSync(
        path.join(processCwd, 'src'), ['**.js'],
        readdir.ABSOLUTE_PATHS
      )
      .reduce((result, file) => {
        if (file.indexOf('__tests__') === -1) {
          result[file] = true;
        }

        return result;
      }, {})
  },

  jscs: {
    files: sourceFiles,
    configFile: path.join(__dirname, '../.jscsrc')
  },

  eslint: {
    files: sourceFiles,
    configFile: path.join(__dirname, '../.eslintrc'),
    extensions: ['.js', '.jsx']
  },

  webpack: {
    watch: false,
    config: Object.assign({}, {
      entry: [
        require.resolve('babel-polyfill'),
        path.join(processCwd, 'src/index.js')
      ],
      output: {
        path: path.join(processCwd, 'dist'),
        filename: 'index.js',
        libraryTarget: 'umd'
      }
    }, webpackConfig)
  }
};
