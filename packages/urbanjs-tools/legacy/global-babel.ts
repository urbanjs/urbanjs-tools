import {join} from 'path';

export const babelConfig = {
  babelrc: false,
  extends: join(__dirname, '../../.babelrc')
};
