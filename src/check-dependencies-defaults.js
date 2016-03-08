'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  files: require('./lib/global-source-files'),
  packageFile: path.join(processCwd, 'package.json')
};
