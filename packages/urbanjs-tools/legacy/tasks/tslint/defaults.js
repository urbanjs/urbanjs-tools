'use strict';

const path = require('path');

module.exports = {
  configFile: path.join(__dirname, '../../../tslint.json'),
  extensions: ['.ts', 'tsx'],
  files: require('../../utils/global-source-files'),
  formatter: 'verbose',
  rulesDirectory: path.dirname(require.resolve('tslint-microsoft-contrib'))
};