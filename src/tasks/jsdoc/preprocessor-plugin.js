'use strict';

const globals = require('../../index-globals');
const preprocessor = require('../../lib/helper-preprocessor');

exports.handlers = {

  beforeParse(event) {
    const src = preprocessor.processWithBabel(event.source, event.filename, globals.babel);

    event.source = src;// eslint-disable-line no-param-reassign
    return src;
  }

};
