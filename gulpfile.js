'use strict';

const fs = require('fs');
const gulp = require('gulp');
const sequence = require('gulp-sequence');
const tools = require('./src');

const webpackConfig = Object.assign({}, tools.defaults.webpack.config, {
  externals: [
    (contextPath, moduleName, callback) => {
      if (contextPath.indexOf('node_modules') === -1) {
        // webpack does not handle require.resolve well,
        // see https://webpack.github.io/docs/api-in-modules.html#require-resolve
        const requireResolveModules = [
          'babel-loader',
          'babel-plugin-transform-runtime',
          'babel-polyfill',
          'babel-preset-es2015',
          'babel-preset-stage-0',
          'babel-preset-react',
          'jsdoc/jsdoc',
          'json-loader',
          'retire'
        ];

        if (requireResolveModules.indexOf(moduleName) !== -1) {
          // fix require.resolve dependencies
          return callback(null, `var require.resolve('${moduleName}')`);
        } else if (/^\..+$/.test(moduleName)) {
          // bundle source files
          return callback();
        }
      }

      // require everything else
      callback(null, `commonjs ${moduleName}`);
    }
  ]
});

tools.initialize(gulp, {
  eslint: {
    rules: {
      strict: 0
    }
  },
  webpack: {
    config: [
      Object.assign({}, webpackConfig, {
        entry: './src/index.js',
        output: {
          path: 'dist',
          filename: 'index.js',
          libraryTarget: 'commonjs2'
        }
      }),

      Object.assign({}, webpackConfig, {
        entry: './src/cli/index.js',
        output: {
          path: 'dist',
          filename: 'cli.js',
          libraryTarget: 'commonjs'
        }
      })
    ]
  }
});

gulp.task('webpack:fix', done => {
  fs.readFile('./dist/index.js', 'utf8', (err, content) => {
    if (err) {
      done(err);
    }

    fs.writeFile(
      './dist/index.js',
      content.replace(/\/\*require.resolve\*\//g, '__webpack_require__'),
      'utf8',
      done
    );
  });
});

gulp.task('dist', sequence('webpack', 'webpack:fix'));

gulp.task('default', ['pre-release']);
