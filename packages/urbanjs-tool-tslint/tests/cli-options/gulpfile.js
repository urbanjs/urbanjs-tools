'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.tslint.register(gulp, 'tslint', true);
