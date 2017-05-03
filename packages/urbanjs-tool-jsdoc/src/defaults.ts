import {join} from 'path';
import {JSDocConfig} from './types';

export const defaults: JSDocConfig = {
  configFile: join(__dirname, '../.jsdocrc'),
  packagePath: join(require.resolve('jsdoc/jsdoc'), '../')
};
