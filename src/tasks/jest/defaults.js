'use strict';

const path = require('path');

module.exports = {
  name: '',
  rootDir: path.join(process.cwd(), 'src'),
  automock: true,
  unmockedModulePathPatterns: ['babel-runtime/.*'],
  transform: {
    '^.+\\.(js|ts|tsx)$': path.join(__dirname, 'preprocessor.js')
  },
  collectCoverage: true,
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  testRegex: '/__tests__/.+[.-](test|spec)\\.(js|ts|tsx)$'// eslint-disable-line no-useless-escape
};
