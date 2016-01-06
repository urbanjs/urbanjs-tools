'use strict';

const babel = require('babel-core');

module.exports = {
  process(src, filename) {
    if (filename.indexOf('node_modules') === -1 && babel.util.canCompile(filename)) {
      return babel.transform(src, {
        filename,
        retainLines: true,
        presets: ['es2015', 'react', 'stage-0']
      }).code;
    }

    return src;
  }
};
