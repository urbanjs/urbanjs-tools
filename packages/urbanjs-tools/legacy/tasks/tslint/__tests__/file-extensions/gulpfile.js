'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'tslint', {
  configFile: path.join(__dirname, '../../../../../tslint.json'),
  extensions: ['.tsx'],
  files: 'index-invalid.tsx'
});
