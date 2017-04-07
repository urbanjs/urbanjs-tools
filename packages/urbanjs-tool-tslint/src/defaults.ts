import {join, dirname} from 'path';
import {TslintConfig} from './types';
import {GlobalConfiguration} from '@tamasmagedli/urbanjs-tools-core';

export function getDefaults(globals: GlobalConfiguration): TslintConfig {
  return {
    files: globals.sourceFiles,
    configFile: join(__dirname, '../tslint.json'),
    extensions: ['.ts', 'tsx'],
    formatter: 'verbose',
    rulesDirectory: dirname(require.resolve('tslint-microsoft-contrib'))
  };
}
