'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'babel', true, {
  babel: {},
  sourceFiles: path.join(__dirname, 'index.js')
});
