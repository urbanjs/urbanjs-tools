'use strict';

const path = require('path');

module.exports = {
  configFile: path.join(__dirname, '../../../.eslintrc'),
  extensions: ['.js'],
  files: require('../../utils/global-source-files')
};
