import {join} from 'path';
import {EslintConfig} from './types';
import {GlobalConfiguration} from '@tamasmagedli/urbanjs-tools-core';

export function getDefaults(globals: GlobalConfiguration): EslintConfig {
  return {
    files: globals.sourceFiles,
    configFile: join(__dirname, '../.eslintrc'),
    extensions: ['.js']
  };
}
