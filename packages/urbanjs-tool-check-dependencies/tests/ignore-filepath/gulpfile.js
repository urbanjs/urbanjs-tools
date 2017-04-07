'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks['check-dependencies'].register(gulp, 'check-dependencies', {
  packageFile: path.join(__dirname, 'package.json'),
  files: [
    `${path.join(__dirname, '**/*')}`,
    `!${path.join(__dirname, 'gulpfile.js')}`
  ]
});

