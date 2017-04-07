import {WebpackConfig} from './types';
import {isAbsolute} from 'path';
import {GlobalConfiguration} from '@tamasmagedli/urbanjs-tools-core';

export function getDefaults(globals: GlobalConfiguration): WebpackConfig {
  return {
    clean: true,
    cache: true,
    context: process.cwd(),
    entry: './src',

    output: {
      path: 'dist',
      filename: 'index.js',
      libraryTarget: 'commonjs'
    },

    target: 'node',
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
        'node_modules/urbanjs-tools/node_modules',
        'node_modules'
      ]
    },

    externals: [
      (context, request, callback) => {
        const isSourceFile = isAbsolute(request) || /^\..+/.test(request);
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
              loader: require.resolve('babel-loader'),
              options: globals.babel
            },
            {
              loader: require.resolve('ts-loader'),
              options: globals.typescript
            }
          ]
        },
        {
          test: /[^.min]\.js$/, // minified files are ignored
          exclude: /(node_modules|bower_components|vendor|dist)/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: globals.babel
            }
          ]
        }
      ]
    }
  };
}
