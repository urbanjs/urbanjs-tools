'use strict';

const babylon = require('babylon');
const globals = require('../../index-globals');
const preprocessor = require('../../utils/helper-preprocessor');

module.exports = function parser(content, filename) {
  return babylon.parse(
    preprocessor.transpile(content, filename, globals.babel, globals.typescript),
    { sourceType: 'module' }
  );
};
