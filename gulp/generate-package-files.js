'use strict';

const gulp = require('gulp');
const path = require('path');
const through2 = require('through2');
const pkg = require('../package.json');

function applyVersions(dependencies) {
  return Object.keys(dependencies || {}).reduce((acc, depName) => {
    const urbanjsPackageName = (depName.match(/urbanjs-tools?(-.+)?$/) || [])[0];

    let version = dependencies[depName];
    if (urbanjsPackageName) {
      const rawPackageFile = `../packages/${urbanjsPackageName}/_package.json`;
      version = `^${require(rawPackageFile).version}`; // eslint-disable-line
    } else if (pkg.devDependencies[depName]) {
      version = pkg.devDependencies[depName];
    } else if (version === '*') {
      throw new Error(`Missing dependency ${depName}`);
    }

    acc[depName] = version; // eslint-disable-line no-param-reassign
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

      cb(null, Object.assign(file, {
        contents: new Buffer(JSON.stringify(rawPkg)),
        path: path.format(Object.assign(path.parse(file.path), {
          base: 'package.json'
        }))
      }));
    }))
    .pipe(gulp.dest('./packages'))
);
