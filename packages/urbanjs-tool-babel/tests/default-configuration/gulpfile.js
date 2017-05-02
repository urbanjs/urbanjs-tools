'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.tasks.babel.register(gulp, 'babel', true);
