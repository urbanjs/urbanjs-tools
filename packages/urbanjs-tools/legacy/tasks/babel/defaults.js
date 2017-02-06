'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  babel: require('../../utils/global-babel'),
  files: [
    path.join(processCwd, 'src/**/*.+(js|ts|tsx)'),
    `!${path.join(processCwd, 'src/**/__tests__/**')}`,
    `!${path.join(processCwd, 'src/**/test/**')}`
  ],
  outputPath: path.join(processCwd, 'dist'),
  sourcemap: {
    loadMaps: true
  }
};
