import {join} from 'path';

export const globals = {
  typescript: require('../tsconfig.json').compilerOptions, //tslint:disable-line
  babel: {
    babelrc: false,
    extends: join(__dirname, '../.babelrc')
  },
  sourceFiles: [
    '!**/+(node_modules|bower_components|vendor|dist)/**/*',
    '!**/*.min.js',
    'bin/**/*.js',
    'src/**/*.+(js|ts|tsx)',
    'gulp/**/*.js',
    'gulpfile.js'
  ].map(globPath => `${globPath[0] === '!' ? '!' : ''}${join(process.cwd(), globPath.replace(/^!/, ''))}`)
};
