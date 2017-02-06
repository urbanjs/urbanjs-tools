'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'conventional-changelog', {
  changelogFile: path.join(__dirname, 'CHANGELOG.md'),
  outputPath: __dirname
});
