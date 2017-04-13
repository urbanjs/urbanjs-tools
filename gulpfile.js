'use strict';

require('./gulp/generate-package-files');
require('./gulp/bootstrap');

const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const gulpShell = require('gulp-shell');
const path = require('path');

gulp.task('bootstrap:transpile', (done) => {
  const packages = [
    'urbanjs-tools-core',
    'urbanjs-tools-cli',
    'urbanjs-tools',
    'urbanjs-tool-babel',
    'urbanjs-tool-check-dependencies',
    'urbanjs-tool-check-file-names',
    'urbanjs-tool-conventional-changelog',
    'urbanjs-tool-eslint',
    'urbanjs-tool-mocha',
    'urbanjs-tool-nsp',
    'urbanjs-tool-retire',
    'urbanjs-tool-tslint',
    'urbanjs-tool-webpack'
  ];

  (function next(remainingPackages) {
    if (!remainingPackages.length) {
      done();
      return;
    }

    const current = remainingPackages[0];
    const options = { cwd: path.join(__dirname, 'packages', current) };
    const commands = ['../../node_modules/.bin/gulp babel'];

    gulpShell.task(commands, options)(() => next(remainingPackages.slice(1)));
  }(packages));
});

gulp.task('pre-release', gulpSequence(
  'generate-package-files',
  'bootstrap:transpile',
  'bootstrap'
));

gulp.task('default', ['pre-release']);
