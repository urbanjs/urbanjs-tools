'use strict';

module.exports = {

  getFileExtensionRegExp(extensions) {
    return new RegExp(`(${extensions.map(extension => extension.replace('.', '\\.')).join('|')})$`);
  }
};
