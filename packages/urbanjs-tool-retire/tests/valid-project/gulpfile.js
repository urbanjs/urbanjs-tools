'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks.retire.register(gulp, 'retire', {
  packagePath: path.join(require.resolve('retire'), '../../')
});
