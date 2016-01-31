'use strict';

const path = require('path');

module.exports = {
  configFile: path.join(__dirname, '../.jsdocrc'),
  executablePath: path.join(require.resolve('jsdoc/jsdoc'), '../../.bin/')
};
