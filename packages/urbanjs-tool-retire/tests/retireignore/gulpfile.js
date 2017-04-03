'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.retire.register(gulp, 'retire', true);
