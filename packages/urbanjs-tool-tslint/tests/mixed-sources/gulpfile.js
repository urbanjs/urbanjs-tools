'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.tslint.register(gulp, 'tslint', {
  configFile: path.join(__dirname, '../../tslint.json'),
  extensions: ['.ts', '.tsx'],
  files: '**/*'
});
