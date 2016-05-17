'use strict';

const path = require('path');

module.exports = {
  configFile: path.join(__dirname, '../../../.jscsrc'),
  files: require('../../utils/global-source-files')
};
