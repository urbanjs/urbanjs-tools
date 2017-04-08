import {join} from 'path';

const processCwd = process.cwd();

export const defaults = {
  files: join(processCwd, 'src/+(test|tests)/**/*.+(js|ts|tsx)'),
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
    '!src/**/__tests__/**',
    '!src/**/test/**',
    '!src/**/tests/**',
    '!src/**/*-tests?.+(js|ts|tsx)'
  ].map(globPath => `${globPath[0] === '!' ? '!' : ''}${join(processCwd, globPath.replace(/^!/, ''))}`),
  coverageThresholds: null
};
