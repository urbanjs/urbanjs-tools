'use strict';

const merge = require('lodash.merge');
const defaults = require('./index-defaults');

const checkFileNames = require('./check-file-names');
const eslint = require('./eslint');
const jest = require('./jest');
const jscs = require('./jscs');
const jsdoc = require('./jsdoc');
const nsp = require('./nsp');
const webpack = require('./webpack');

/**
 * @module main
 */
module.exports = {

  /**
   * @type {Object}
   * @property {module:tasks/checkFileNames} checkFileNames
   * @property {module:tasks/eslint} eslint
   * @property {module:tasks/jest} jest
   * @property {module:tasks/jscs} jscs
   * @property {module:tasks/jsdoc} jsdoc
   * @property {module:tasks/nsp} nsp
   * @property {module:tasks/webpack} webpack
   */
  tasks: {
    checkFileNames,
    eslint,
    jest,
    jscs,
    jsdoc,
    nsp,
    webpack
  },

  /**
   * Initializes the gulp with the common tasks.
   * @param {external:Gulp} gulp
   * @param {module:main.Configuration} [configuration]
   */
  initialize(gulp, configuration) {
    const config = merge({}, defaults, configuration);

    [
      ['checkFileNames', 'check-file-names'],
      ['eslint'],
      ['jest'],
      ['jscs'],
      ['jsdoc'],
      ['nsp'],
      ['webpack'],
    ].forEach(task => {
      this.tasks[task[0]].register(gulp, task[1] || task[0], config[task[0]]);
    });

    gulp.task('dist', ['webpack']);

    gulp.task('doc', ['jsdoc']);

    gulp.task('test', ['jest']);

    gulp.task('analyse', ['check-file-names', 'jscs', 'eslint', 'nsp']);

    gulp.task('pre-commit', ['analyse', 'test']);

    gulp.task('pre-release', ['pre-commit', 'dist', 'doc']);
  }

};
