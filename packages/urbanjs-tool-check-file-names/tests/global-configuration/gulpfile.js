'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.setGlobalConfiguration({
  sourceFiles: path.join(__dirname, '**')
});

tools.tasks['check-file-names'].register(gulp, 'check-file-names', true);

