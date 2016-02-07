'use strict';

const del = require('del');
const fs = require('fs');
const mkdir = require('mkdirp');
const path = require('path');

module.exports = {
  exists(targetPath) {
    return new Promise((resolve) => {
      fs.stat(targetPath, err => resolve(!err));
    });
  },

  delete(targetPath) {
    return del(targetPath, { force: true });
  },

  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, content) => {
        return err ? reject(`File cannot be read: ${filePath}`) : resolve(content);
      });
    });
  },

  writeFile(targetPath, content) {
    return new Promise((resolve, reject) => {
      const folderPath = path.dirname(targetPath);
      mkdir(folderPath, err => {
        if (err) {
          reject(`Folder cannot be created: ${folderPath}`);
          return;
        }

        fs.writeFile(targetPath, content, writeErr => {
          return writeErr ? reject(`File cannot be written: ${targetPath}`) : resolve();
        });
      });
    });
  }
};
