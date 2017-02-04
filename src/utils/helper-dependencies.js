'use strict';

module.exports = {
  babelConfig: [
    'babel-plugin-transform-runtime',
    'babel-plugin-transform-decorators-legacy',
    'babel-preset-es2015',
    'babel-preset-react',
    'babel-preset-stage-0'
  ],
  streamHelper: [
    'merge-stream',
    'fork-stream',
    'through2',
    'duplexify'
  ],
  transpileHelper: [
    'babel-core',
    'gulp-typescript',
    'typescript'
  ],
  runtime: [
    'babel-runtime'
  ]
};
