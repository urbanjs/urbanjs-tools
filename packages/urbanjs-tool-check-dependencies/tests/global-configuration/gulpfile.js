'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.setGlobalConfiguration({
  sourceFiles: path.join(__dirname, 'index.js')
});

tools.tasks['check-dependencies'].register(gulp, 'check-dependencies', {
  packageFile: path.join(__dirname, 'package.json')
});

