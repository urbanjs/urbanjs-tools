'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  files: path.join(processCwd, 'src/test/**/*.+(js|ts|tsx)'),
  require: `${path.join(__dirname, 'preprocessor.js')}`
};
