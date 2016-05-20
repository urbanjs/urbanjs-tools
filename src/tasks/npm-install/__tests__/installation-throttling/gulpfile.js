'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.register(gulp, 'npmInstallA', {
  dependencies: {
    'left-pad': '1.1.0'
  }
});

task.register(gulp, 'npmInstallB', {
  dependencies: {
    'node-uuid': '1.4.7'
  }
});

task.register(gulp, 'npmInstallC', {
  dependencies: {
    'left-pad': '1.1.0'
  }
});

gulp.task('npmInstall', ['npmInstallA', 'npmInstallB', 'npmInstallC']);
