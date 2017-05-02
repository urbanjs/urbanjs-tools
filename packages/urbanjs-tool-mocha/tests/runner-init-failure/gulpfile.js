'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks.mocha.register(gulp, 'mocha', {
  require: path.join(__dirname, 'setup-file.js')
});
