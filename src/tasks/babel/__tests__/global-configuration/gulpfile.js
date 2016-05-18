'use strict';

const globalBabelConfig = require('../../../../utils/global-babel');
const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'babel', true, {
  babel: globalBabelConfig,
  sourceFiles: path.join(__dirname, '**')
});
