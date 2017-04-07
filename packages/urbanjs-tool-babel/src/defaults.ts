import {join} from 'path';
import {BabelConfig} from './types';

const processCwd = process.cwd();

export const defaults: BabelConfig = {
  files: [
    'src/**/*',
    '!src/**/*.min.js',
    '!src/**/+(node_modules|bower_components|vendor|dist)/**/*',
    '!src/**/__tests__/**',
    '!src/**/test/**',
    '!src/**/tests/**',
    '!src/**/*-tests.+(js|ts|tsx)'
  ].map(globPath => `${globPath[0] === '!' ? '!' : ''}${join(processCwd, globPath.replace(/^!/, ''))}`),
  outputPath: join(processCwd, 'dist'),
  clean: true
};
