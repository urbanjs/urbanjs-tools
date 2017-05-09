import {join} from 'path';
import {MochaConfig} from './types';
import {GlobalConfiguration} from 'urbanjs-tools-core';

const processCwd = process.cwd();
const addProcessCwd = globPath => `${globPath[0] === '!' ? '!' : ''}${join(processCwd, globPath.replace(/^!/, ''))}`;

export function getDefaults(globals: GlobalConfiguration): MochaConfig {
  return {
    files: [
      'src/+(test|tests)/**/*.+(js|ts|tsx)',
      'src/**/*-+(test|tests).+(js|ts|tsx)'
    ].map(addProcessCwd),
    require: [],
    maxConcurrency: 0,
    runnerMemoryUsageLimit: 0, // [bytes]
    collectCoverage: true,
    coverageReporters: ['text-summary', 'html'],
    coverageDirectory: 'coverage',
    coverageFrom: []
      .concat([
        'src/**/*.+(js|ts|tsx)',
        '!src/**/+(test|tests)/**',
        '!src/**/*-+(test|tests).+(js|ts|tsx)'
      ].map(addProcessCwd))
      .concat(globals.ignoredSourceFiles.map(globPath => `!${globPath}`)),
    coverageThresholds: null
  };
}
