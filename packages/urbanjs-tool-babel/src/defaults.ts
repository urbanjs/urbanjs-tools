import {join} from 'path';
import {BabelConfig} from './types';
import {GlobalConfiguration} from 'urbanjs-tools-core';

const processCwd = process.cwd();
const addProcessCwd = globPath => `${globPath[0] === '!' ? '!' : ''}${join(processCwd, globPath.replace(/^!/, ''))}`;

export function getDefaults(globals: GlobalConfiguration): BabelConfig {
  return {
    files: []
      .concat([
        'src/**/*',
        '!src/**/+(test|tests)/**',
        '!src/**/*-+(test|tests).+(js|ts|tsx)'
      ].map(addProcessCwd))
      .concat(globals.ignoredSourceFiles.map(globPath => `!${globPath}`)),
    outputPath: join(processCwd, 'dist'),
    clean: true
  };
}
