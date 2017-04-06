'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.setGlobalConfiguration({
  sourceFiles: 'index-invalid.js'
});

tools.tasks.eslint.register(gulp, 'eslint', true);
