'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  files: path.join(processCwd, 'src/+(test|tests)/**/*.+(js|ts|tsx)'),
  require: `${path.join(__dirname, 'setup-file.js')}`,
  maxConcurrency: 0,
  runnerMemoryUsageLimit: 0, // [bytes]
  collectCoverage: true,
  coverageReporters: ['text-summary', 'html'],
  coverageDirectory: 'coverage',
  coverageFrom: [
    path.join(processCwd, 'src/**/*.+(js|ts|tsx)'),
    `!${path.join(processCwd, 'src/**/*-+(spec|test).+(js|ts|tsx)')}`,
    `!${path.join(processCwd, 'src/**/__tests__/**/*')}`,
    `!${path.join(processCwd, 'src/**/+(test|tests)/**/*')}`
  ],
  coverageThresholds: null
};
