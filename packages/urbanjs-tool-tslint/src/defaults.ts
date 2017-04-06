import {join, dirname} from 'path';
import {TslintConfig} from './types';

export const defaults: TslintConfig = {
  files: [],
  configFile: join(__dirname, '../tslint.json'),
  extensions: ['.ts', 'tsx'],
  formatter: 'verbose',
  rulesDirectory: dirname(require.resolve('tslint-microsoft-contrib'))
};
