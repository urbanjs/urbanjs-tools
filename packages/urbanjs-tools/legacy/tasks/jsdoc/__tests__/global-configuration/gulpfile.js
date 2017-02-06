'use strict';

const gulp = require('gulp');
const path = require('path');
const task = require('../../index');

task.dependencies = {};
task.register(gulp, 'jsdoc', {
  configFile: path.join(__dirname, 'jsdoc.json'),
  packagePath: path.join(require.resolve('jsdoc/jsdoc'), '../')
}, { babel: require('../../../../utils/global-babel') });
