'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks.babel.register(gulp, 'babel', {
  babel: { babelrc: false },
  files: path.join(__dirname, 'index.js'),
  outputPath: path.join(__dirname, 'dist'),
  sourcemap: false
});
