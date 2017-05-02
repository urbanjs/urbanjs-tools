'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.setGlobalConfiguration({
  sourceFiles: 'index-invalid.ts'
});

tools.tasks.tslint.register(gulp, 'tslint', true);
