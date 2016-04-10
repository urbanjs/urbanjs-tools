'use strict';

const babylon = require('babylon');

module.exports = function parser(content) {
  return babylon.parse(content, {
    sourceType: 'module',

    // Enable all possible babylon plugins.
    plugins: ['flow', 'jsx', '*']
  });
};
