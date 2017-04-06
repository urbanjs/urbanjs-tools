'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.eslint.register(gulp, 'eslint', {
  configFile: '.eslintrc',
  files: '**/*',
  extensions: ['.jsx']
});
