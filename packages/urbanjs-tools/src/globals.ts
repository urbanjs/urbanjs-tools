import {join} from 'path';

const processCwd = process.cwd();
const addProcessCwd = globPath => `${globPath[0] === '!' ? '!' : ''}${join(processCwd, globPath.replace(/^!/, ''))}`;

export const globals = {
  typescript: require('../tsconfig.json').compilerOptions, //tslint:disable-line
  babel: {
    babelrc: false,
    extends: join(__dirname, '../.babelrc')
  },
  sourceFiles: []
    .concat([
      'bin/**/*.js',
      'src/**/*.+(js|ts|tsx)',
      'gulp/**/*.js',
      'gulpfile.js'
    ].map(addProcessCwd))
    .concat([
      '!**/+(node_modules|bower_components)/**/*',
      '!**/*.min.js',
    ])
};
