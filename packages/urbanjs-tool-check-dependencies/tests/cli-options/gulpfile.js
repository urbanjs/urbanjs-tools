'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks['check-dependencies'].register(gulp, 'check-dependencies', true);
