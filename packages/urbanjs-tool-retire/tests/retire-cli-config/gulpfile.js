'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks.retire.register(gulp, 'retire', defaults => Object.assign({}, defaults, {
  options: `--ignorefile ${path.join(__dirname, 'custom-retireignore')}`
}));
