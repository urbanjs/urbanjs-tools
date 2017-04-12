'use strict';

require('./gulp/generate-package-files');
require('./gulp/bootstrap');

const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const gulpShell = require('gulp-shell');

gulp.task('bootstrap:transpile', (done) => {
  gulpShell.task(['node_modules/.bin/lerna exec gulp babel'])(done);
});

gulp.task('pre-release', gulpSequence(
  'generate-package-files',
  'bootstrap:transpile',
  'bootstrap'
));

gulp.task('default', ['pre-release']);
