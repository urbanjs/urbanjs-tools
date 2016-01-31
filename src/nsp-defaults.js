'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  packageFile: path.join(processCwd, 'package.json')
};
