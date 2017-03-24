'use strict';

require('../../gulp/pre-release');

const gulp = require('gulp');
const fs = require('fs');
const through2 = require('through2');
const tools = require('urbanjs-tools');

gulp.task('generate-versions-file', [], (done) => {
  const packages = [
    '../*/_package.json',
    '!../urbanjs-tools-cli/_package.json'
  ];

  const versions = {};

  gulp.src(packages)
    .pipe(through2.obj((file, enc, cb) => {
      const pkg = JSON.parse(file.contents);
      versions[pkg.name] = `^${pkg.version}`;
      cb(null);
    }))
    .on('data', () => {
    })
    .on('end', () => {
      fs.writeFile('./versions.json', JSON.stringify(versions), done);
    });
});


tools.initializePresets(gulp, {
  'pre-release': defaults => ['generate-versions-file'].concat(defaults)
});
