import {join} from 'path';

export const defaults = {
  packagePath: join(require.resolve('retire'), '../../'),
  options: '-n -c'
};
