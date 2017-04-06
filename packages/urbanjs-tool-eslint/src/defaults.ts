import {join} from 'path';
import {EslintConfig} from './types';

export const defaults: EslintConfig = {
  files: [],
  configFile: join(__dirname, '../.eslintrc'),
  extensions: ['.js']
};
