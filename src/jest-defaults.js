'use strict';

const path = require('path');
const sourceFolderPath = path.join(process.cwd(), 'src');

module.exports = {
  name: '',
  rootDir: sourceFolderPath,
  unmockedModulePathPatterns: ['babel-runtime/.*'],
  scriptPreprocessor: path.join(__dirname, 'jest-preprocessor.js'),
  collectCoverage: true
};
