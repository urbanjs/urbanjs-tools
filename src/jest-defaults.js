'use strict';

const readdir = require('readdir');
const path = require('path');
const sourceFolderPath = path.join(process.cwd(), 'src');

module.exports = {
  rootDir: sourceFolderPath,
  unmockedModulePathPatterns: ['core-js/.*'],
  setupEnvScriptFile: path.join(__dirname, 'jest-set-env-script.js'),
  scriptPreprocessor: path.join(__dirname, 'jest-preprocessor.js'),
  collectCoverage: true,
  collectCoverageOnlyFrom: readdir
    .readSync(
      sourceFolderPath, ['**.js'],
      readdir.ABSOLUTE_PATHS
    )
    .reduce((result, file) => {
      if (file.indexOf('__tests__') === -1) {
        result[file] = true; // eslint-disable-line no-param-reassign
      }

      return result;
    }, {})
};
