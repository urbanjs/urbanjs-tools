'use strict';

const process = require('./jest-preprocessor').process;

exports.handlers = {

  beforeParse(event) {
    event.source = process(event.source, event.filename);
  }

};
