'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  files: require('../../utils/global-source-files'),
  packageFile: path.join(processCwd, 'package.json')
};
