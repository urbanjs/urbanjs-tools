'use strict';

const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const gulpTs = require('gulp-typescript');
const path = require('path');
const readdir = require('readdir');
const tsCompilerOptions = require('../packages/urbanjs-tools/tsconfig.json').compilerOptions;

gulp.task('babel', () =>
  gulp.src(path.join(process.cwd(), 'src/**/*.ts'))
    .pipe(gulpTs(tsCompilerOptions))
    .pipe(gulp.dest('dist/'))
);

let tools;

[
  () => {
    tools = require('../packages/urbanjs-tools'); // eslint-disable-line
  },

  () => {
    tools.getTool('check-dependencies').register(gulp, 'check-dependencies', true);
  },

  () => {
    tools.getTool('check-file-names').register(gulp, 'check-file-names', true);
  },

  () => {
    tools.getTool('eslint').register(gulp, 'eslint', defaults => Object.assign({}, defaults, {
      rules: {
        'import/no-unresolved': 0
      },
      files: defaults.files.concat([
        'tests/**/*.js',
        '!**/*-invalid.js',
        '!**/coverage/**/*',
        '!**/dist/**/*',
        '!legacy/**'
      ])
    }));
  },

  () => {
    tools.getTool('mocha').register(gulp, 'test', {
      files: ['src/**/*-tests.ts'],
      require: path.join(__dirname, 'mocha-environment.js'),
      collectCoverage: false
    });
  },

  () => {
    tools.getTool('mocha').register(gulp, 'test-e2e', {
      files: readdir.readSync(
        'tests',
        ['*-tests.ts'],
        readdir.ABSOLUTE_PATHS
      ).map(file => [file]),
      require: path.join(__dirname, 'mocha-environment.js'),
      collectCoverage: false,
      timeout: 50000
    });
  },

  () => {
    tools.getTool('nsp').register(gulp, 'nsp', true);
  },

  () => {
    tools.getTool('retire').register(gulp, 'retire', true);
  },

  () => {
    tools.getTool('tslint').register(gulp, 'tslint', {
      configFile: '../../tslint.json'
    });
  }
].forEach((item) => {
  try {
    process.env.URBANJS_SILENT = 'true';
    item();
  } catch (e) {
    // ignore
  } finally {
    delete process.env.URBANJS_SILENT;
  }
});

gulp.task('pre-release', gulpSequence(
  'check-dependencies',
  'check-file-names',
  'eslint',
  'test',
  'tslint',
  'test-e2e'
));
