'use strict';

const path = require('path');

module.exports = {
  packagePath: path.join(require.resolve('retire'), '../../'),
  options: '-n -c'
};
