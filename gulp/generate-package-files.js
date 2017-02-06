'use strict';

const gulp = require('gulp');
const path = require('path');
const through2 = require('through2');
const pkg = require('../package.json');

function applyVersions(dependencies) {
  return Object.keys(dependencies || {}).reduce((acc, depName) => {
    const urbanjsPackageName = (depName.match(/urbanjs-tools(-.+)$/) || [])[0];

    if (urbanjsPackageName) {
      acc[depName] = require(`../packages/${urbanjsPackageName}/_package.json`).version;
    } else if (pkg.devDependencies[depName]) {
      acc[depName] = pkg.devDependencies[depName];
    } else {
      acc[depName] = dependencies[depName];
    }

    return acc;
  }, {});
}

gulp.task('generate-package-files', [], () =>
  gulp.src(path.join(__dirname, '../packages/**/_package.json'))
    .pipe(through2.obj((file, enc, cb) => {
      const rawPkg = JSON.parse(file.contents);

      rawPkg.engines = pkg.engines;
      rawPkg.license = pkg.license;
      rawPkg.author = pkg.author;
      rawPkg.repository = pkg.repository;
      rawPkg.dependencies = applyVersions(rawPkg.dependencies);
      rawPkg.devDependencies = applyVersions(rawPkg.devDependencies);

      file.contents = new Buffer(JSON.stringify(rawPkg));
      file.path = path.format(Object.assign(path.parse(file.path), {
        base: 'package.json'
      }));

      cb(null, file);
    }))
    .pipe(gulp.dest('./packages'))
);
