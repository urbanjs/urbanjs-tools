'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks.mocha.register(gulp, 'mocha', true);
