'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.register(gulp, 'check-dependencies', true);
