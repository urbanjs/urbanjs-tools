'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks['conventional-changelog'].register(gulp, 'conventional-changelog', true);
