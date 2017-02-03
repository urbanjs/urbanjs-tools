'use strict';

const helper = require('./helper-config');
const path = require('path');
const processCwd = process.cwd();

module.exports = {
  entry: path.join(processCwd, 'src'),

  output: {
    path: path.join(processCwd, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },

  target: 'node',
  bail: true, // quit after the first error
  devtool: 'source-map', // generate production supported source map

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },

  plugins: [],

  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },

  resolveLoader: {
    modules: [// used loaders might have dependencies installed only in urbanjs
      path.join(processCwd, 'node_modules/urbanjs-tools/node_modules'),
      path.join(processCwd, 'node_modules')
    ]
  },

  externals: [
    (context, request, callback) => {
      const isSourceFile = path.isAbsolute(request) || /^\..+/.test(request);
      callback(null, !isSourceFile);
    }
  ],

  module: {
    rules: [
      {
        test: /[^.min]\.tsx?$/, // minified files are ignored
        exclude: /(node_modules|bower_components|vendor|dist)/,
        use: [
          {
            loader: require.resolve('awesome-typescript-loader'),
            options: helper.getTSLoader(
              require('../../utils/global-typescript'),
              require('../../utils/global-babel')
            )
          }
        ]
      },
      {
        test: /[^.min]\.js$/, // minified files are ignored
        exclude: /(node_modules|bower_components|vendor|dist)/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: require('../../utils/global-babel')
          }
        ]
      }
    ]
  }
};
