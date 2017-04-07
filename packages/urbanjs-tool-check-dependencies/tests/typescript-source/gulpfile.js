'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks['check-dependencies'].register(gulp, 'check-dependencies', {
  files: path.join(__dirname, 'index.ts'),
  packageFile: path.join(__dirname, 'package.json')
});

