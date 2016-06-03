'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'babel', true, {
  babel: {
    babelrc: false
  }
});
