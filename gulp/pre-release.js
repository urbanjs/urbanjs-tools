'use strict';

const del = require('del');
const gulp = require('gulp');
const fs = require('fs');
const gulpBabel = require('gulp-babel');
const gulpSequence = require('gulp-sequence');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpTs = require('gulp-typescript');
const mergeStream = require('merge-stream');
const path = require('path');
const readdir = require('readdir');
const ts = require('typescript');
const through2 = require('through2');

const tsCompilerOptions = require('../packages/urbanjs-tools/tsconfig.json').compilerOptions;
const babelOptions = JSON.parse(fs.readFileSync(path.join(__dirname, '../packages/urbanjs-tools/.babelrc')));

gulp.task('babel', () => {
  const processCwd = process.cwd();
  const outputFolder = path.join(processCwd, 'dist');

  del.sync(outputFolder, { force: true });

  let stream = gulp.src(path.join(processCwd, 'src/**/*.ts'));
  stream = stream.pipe(gulpSourcemaps.init({ loadMaps: true }));

  const tsPipe = gulpTs(Object.assign({}, tsCompilerOptions, {
    typescript: ts,
    inlineSourceMap: true
  }));
  const dtsPipe = tsPipe.dts.pipe(gulp.dest('dist/'));

  stream = stream.pipe(tsPipe);
  stream = stream.pipe(through2.obj((file, enc, cb) => {
    cb(null, /\.js$/.test(file.path) ? file : null);
  }));
  stream = stream.pipe(gulpBabel(babelOptions));
  stream = stream.pipe(gulpSourcemaps.write('.'));
  stream = stream.pipe(gulp.dest('dist/'));

  return mergeStream(stream, dtsPipe);
});

let tools;

[
  () => {
    delete process.env.URBANJS_SILENT;
    tools = require('../packages/urbanjs-tools'); // eslint-disable-line
    tools.setGlobalConfiguration(defaults => Object.assign({}, defaults, {
      sourceFiles: ['tests/index-tests.ts'].concat(defaults.sourceFiles)
    }));
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
