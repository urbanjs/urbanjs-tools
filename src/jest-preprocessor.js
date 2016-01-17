'use strict';

const babel = require('babel-core');
const globals = require('./index-globals');

module.exports = {
  process(src, filename) {
    if (filename.indexOf('node_modules') === -1 && babel.util.canCompile(filename)) {
      return babel.transform(src, Object.assign({}, globals.babel, {
        filename,
        retainLines: true
      })).code;
    }

    return src;
  }
};
