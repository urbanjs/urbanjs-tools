'use strict';

const path = require('path');
const processCwd = process.cwd();

module.exports = {
  changelogFile: path.join(processCwd, 'CHANGELOG.md'),
  outputPath: processCwd,
  conventionalChangelog: {
    preset: 'angular'
  }
};
