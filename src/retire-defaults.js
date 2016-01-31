'use strict';

const path = require('path');

module.exports = {
  executablePath: path.join(require.resolve('retire'), '../../../.bin/'),
  options: '-n'
};
