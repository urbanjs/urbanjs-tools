'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks.retire.register(gulp, 'retire', true);
