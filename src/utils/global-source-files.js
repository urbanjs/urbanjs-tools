'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = [
  `!${path.join(processCwd, '**/+(node_modules|bower_components|vendor|dist)/**/*')}`,
  path.join(processCwd, 'bin/**/*.js'),
  path.join(processCwd, 'src/**/*.+(js|ts|tsx)'),
  path.join(processCwd, 'gulp/**/*.js'),
  path.join(processCwd, 'gulpfile.js')
];
