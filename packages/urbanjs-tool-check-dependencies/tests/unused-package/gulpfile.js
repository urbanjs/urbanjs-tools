'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks['check-dependencies'].register(gulp, 'check-dependencies', {
  files: path.join(__dirname, 'index.js'),
  packageFile: path.join(__dirname, 'package.json')
});

