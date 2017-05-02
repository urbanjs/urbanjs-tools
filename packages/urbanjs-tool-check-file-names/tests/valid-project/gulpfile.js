'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks['check-file-names'].register(gulp, 'check-file-names', {
  paramCase: path.join(__dirname, '**')
});

