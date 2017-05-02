'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks.webpack.register(gulp, 'webpack', true);
