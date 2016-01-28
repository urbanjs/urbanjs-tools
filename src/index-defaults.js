'use strict';

const path = require('path');
const readdir = require('readdir');
const globals = require('./index-globals');
const webpackConfig = require('./webpack-config.js');
const processCwd = process.cwd();

module.exports = {
  checkFileNames: {
    get paramCase() {
      return globals.sourceFiles;
    }
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
    configFile: path.join(__dirname, '../.jscsrc'),
    get files() {
      return globals.sourceFiles;
    }
  },

  eslint: {
    configFile: path.join(__dirname, '../.eslintrc'),
    extensions: ['.js', '.jsx'],
    get files() {
      return globals.sourceFiles;
    }
  },

  retire: {
    executablePath: path.join(require.resolve('retire'), '../../../.bin/'),
    options: '-n'
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
