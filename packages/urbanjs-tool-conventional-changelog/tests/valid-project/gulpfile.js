'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks['conventional-changelog'].register(gulp, 'conventional-changelog', {
  changelogFile: path.join(__dirname, 'CHANGELOG.md'),
  outputPath: __dirname
});
