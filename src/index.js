'use strict';

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
   * @property {module:tasks/checkFileNames.Parameters} checkFileNames
   * @property {module:tasks/eslint.Parameters} eslint
   * @property {module:tasks/jest.Parameters} jest
   * @property {module:tasks/jscs.Parameters} jscs
   * @property {module:tasks/jsdoc.Parameters} jsdoc
   * @property {module:tasks/nsp.Parameters} nsp
   * @property {module:tasks/webpack.Parameters} webpack
   */
  defaults,

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
    const config = configuration || {};

    [
      ['checkFileNames', 'check-file-names'],
      ['eslint'],
      ['jest'],
      ['jscs'],
      ['jsdoc'],
      ['nsp'],
      ['webpack'],
    ].forEach(task => {
      if (config[task[0]] === false) {
        gulp.task(task[0], done => done());
        return;
      }

      let taskConfig = config[task[0]];
      if (!taskConfig) {
        taskConfig = defaults[task[0]];
      } else if (typeof taskConfig === 'object' && !Array.isArray(taskConfig)) {
        taskConfig = Object.assign({}, defaults[task[0]], taskConfig);
      }

      this.tasks[task[0]].register(gulp, task[1] || task[0], taskConfig);
    });

    gulp.task('dist', ['webpack']);

    gulp.task('doc', ['jsdoc']);

    gulp.task('test', ['jest']);

    gulp.task('analyse', ['check-file-names', 'jscs', 'eslint', 'nsp']);

    gulp.task('pre-commit', ['analyse', 'test']);

    gulp.task('pre-release', ['pre-commit', 'dist', 'doc']);

    gulp.task('default', () => {
      console.log('Not configured yet.'); // eslint-disable-line no-console
    });
  }

};
