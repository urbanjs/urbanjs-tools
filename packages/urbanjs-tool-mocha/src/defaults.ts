import {join} from 'path';

const processCwd = process.cwd();

export const defaults = {
  files: [
    'src/+(test|tests)/**/*.+(js|ts|tsx)',
    'src/**/*-+(test|tests).+(js|ts|tsx)'
  ].map(globPath => `${globPath[0] === '!' ? '!' : ''}${join(processCwd, globPath.replace(/^!/, ''))}`),
  require: [],
  maxConcurrency: 0,
  runnerMemoryUsageLimit: 0, // [bytes]
  collectCoverage: true,
  coverageReporters: ['text-summary', 'html'],
  coverageDirectory: 'coverage',
  coverageFrom: [
    'src/**/*.+(js|ts|tsx)',
    '!src/**/*.min.js',
    '!src/**/+(node_modules|bower_components|vendor|dist)/**/*',
    '!src/**/+(__tests__|test|tests)/**',
    '!src/**/*-+(test|tests).+(js|ts|tsx)'
  ].map(globPath => `${globPath[0] === '!' ? '!' : ''}${join(processCwd, globPath.replace(/^!/, ''))}`),
  coverageThresholds: null
};
