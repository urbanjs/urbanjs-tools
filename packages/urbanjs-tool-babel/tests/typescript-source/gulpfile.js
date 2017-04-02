'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.babel.register(gulp, 'babel', {
  files: path.join(__dirname, 'index.ts'),
  outputPath: path.join(__dirname, 'dist')
});
