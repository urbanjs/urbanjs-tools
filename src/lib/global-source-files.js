'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = [
  path.join(processCwd, 'bin/**/*.js'),
  path.join(processCwd, 'src/**/*.js'),
  path.join(processCwd, 'gulp/**/*.js'),
  path.join(processCwd, 'gulpfile.js')
];
