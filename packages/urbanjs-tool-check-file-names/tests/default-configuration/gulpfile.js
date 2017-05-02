'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks['check-file-names'].register(gulp, 'check-file-names', true);

