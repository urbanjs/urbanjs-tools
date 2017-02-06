'use strict';

require('./gulp/generate-package-files');

const gulp = require('gulp');
const shell = require('gulp-shell');
const tools = require('urbanjs-tools');

tools.initializeTasks(gulp, {
  retire: true,
  nsp: true
});

gulp.task('pre-release', ['generate-package-files', 'retire', 'nsp'], (done) => {
  shell.task([`lerna bootstrap --hoist`])(done);
});
