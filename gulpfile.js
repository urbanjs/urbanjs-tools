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
      '!packages/**/coverage/**/*',
      '!packages/**/dist/**/*',
      '!packages/urbanjs-tools/legacy/**'
    ])
  }),
  retire: true,
  nsp: true
});

gulp.task('pre-release', sequence(
  'generate-package-files',
  'retire',
  'nsp',
  'eslint',
  'bootstrap'
));

gulp.task('default', ['pre-release']);
