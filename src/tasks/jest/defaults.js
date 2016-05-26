'use strict';

const path = require('path');

module.exports = {
  name: '',
  rootDir: path.join(process.cwd(), 'src'),
  unmockedModulePathPatterns: ['babel-runtime/.*'],
  scriptPreprocessor: path.join(__dirname, 'preprocessor.js'),
  collectCoverage: true,
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  testFileExtensions: ['js', 'json', 'ts', 'tsx']
};
