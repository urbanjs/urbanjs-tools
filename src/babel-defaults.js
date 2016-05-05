'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  babel: require('./lib/global-babel'),
  files: path.join(processCwd, 'src/**/*.js'),
  outputPath: path.join(processCwd, 'dist')
};
