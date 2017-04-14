'use strict';

require('../../gulp/pre-release');

const gulp = require('gulp');
const fs = require('fs');
const through2 = require('through2');

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

gulp.task('copy-templates', () =>
  gulp.src('src/**/*.txt')
    .pipe(gulp.dest('dist'))
);

gulp.tasks['pre-release-origin'] = gulp.tasks['pre-release'];
gulp.task('pre-release', ['pre-release-origin', 'generate-versions-file', 'copy-templates']);
