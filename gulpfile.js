'use strict';

require('./gulp/generate-package-files');
require('./gulp/bootstrap');

const gulp = require('gulp');
const sequence = require('gulp-sequence');
const tools = require('urbanjs-tools');

tools.initializeTasks(gulp, {
  eslint: defaults => Object.assign(defaults, {
    files: defaults.files.concat([
      'packages/**/*.js',
      '!packages/urbanjs-tools/legacy/**'
    ])
  }),
  retire: true,
  nsp: true
});

gulp.task('pre-release', sequence(
  'retire',
  'nsp',
  'eslint',
  'generate-package-files',
  'bootstrap'
));

gulp.task('default', ['pre-release']);
