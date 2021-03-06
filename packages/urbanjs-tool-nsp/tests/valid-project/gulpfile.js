'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks.nsp.register(gulp, 'nsp', {
  packageFile: path.join(__dirname, 'package.json')
});
