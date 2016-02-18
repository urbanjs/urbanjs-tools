'use strict';

const babel = require('babel-core');
const globals = require('./index-globals');

module.exports = {
  process(src, filename) {
    if (!babel.util.canCompile(filename)) {
      // You might use a webpack loader in your project
      // that allows you to load custom files (e.g. css, less, scss).
      // Although it is working with webpack but jest
      // don't know how to handle these files.
      // You should never use these files unmocked
      // otherwise you might encounter unexpected behavior.
      // Changing the content of these files
      // to return the raw content.
      return `module.exports = ${JSON.stringify(src)}`;
    }

    if (filename.indexOf('node_modules') === -1) {
      return babel.transform(src, Object.assign({}, globals.babel, {
        filename,
        retainLines: true
      })).code;
    }

    return src;
  }
};
