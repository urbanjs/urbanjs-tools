'use strict';

const globals = require('./index-globals');
const defaults = require('./index-defaults');
const tasks = {
  checkFileNames: require('./check-file-names'),
  eslint: require('./eslint'),
  jest: require('./jest'),
  jscs: require('./jscs'),
  jsdoc: require('./jsdoc'),
  nsp: require('./nsp'),
  retire: require('./retire'),
  webpack: require('./webpack')
};

/**
 * @module main
 */
module.exports = {

  /**
   * @type {Object}
   * @description
   * Global settings that are used by multiple tasks. These settings allow developers
   * to keep common configuration of tasks in sync e.g. babel (used by jest, jsdoc, webpack)
   *
   * Note that these globals can take affect only if the defaults are used
   * e.g. by overwriting the preprocessor of the jest global babel settings are not used anymore
   *
   * @property {Object} babel Parameters of the common babel
   */
  globals,

  /**
   * @type {Object}
   * @description
   * Default parameters of the core tasks
   * These are exposed to be able to set up your own configuration based on the defaults
   *
   * @property {module:tasks/checkFileNames.Parameters} checkFileNames Default parameters of the checkFileNames task
   * @property {module:tasks/eslint.Parameters} eslint Default parameters of the eslint task
   * @property {module:tasks/jest.Parameters} jest Default parameters of the jest task
   * @property {module:tasks/jscs.Parameters} jscs Default parameters of the jscs task
   * @property {module:tasks/jsdoc.Parameters} jsdoc Default parameters of the jsdoc task
   * @property {module:tasks/nsp.Parameters} nsp Default parameters of the nsp task
   * @property {module:tasks/retire.Parameters} retire Default parameters of the retire task
   * @property {module:tasks/webpack.Parameters} webpack Default parameters of the webpack task
   */
  defaults,

  /**
   * @type {Object}
   * @description Core tasks
   *
   * @property {module:tasks/checkFileNames} checkFileNames Validator for checking the names of the files
   * @property {module:tasks/eslint} eslint JS linter
   * @property {module:tasks/jest} jest Unit tester
   * @property {module:tasks/jscs} jscs Code style checker
   * @property {module:tasks/jsdoc} jsdoc API documentation generator
   * @property {module:tasks/nsp} nsp Vulnerability checker
   * @property {module:tasks/retire} retire Vulnerability checker
   * @property {module:tasks/webpack} webpack Bundler
   */
  tasks,

  /**
   * Initializes the given gulp instance with the
   *  core tasks (check-file-names, eslint, jest, jscs, jsdoc, nsp, webpack) and
   *  presets: dist, doc, test, analyze, pre-commit, pre-release
   * @param {external:gulp} gulp The gulp instance to initialize
   * @param {module:main.Configuration|boolean} [configuration] Configuration of the tasks, if false value is given the task won't be initialized
   * @example
   *
   * // initialize with defaults
   * require('urbanjs-tools').initialize(require('gulp'));
   *
   * // initialize with defaults, disable jest
   * require('urbanjs-tools').initialize(require('gulp', { jest: false }));
   */
  initialize(gulp, configuration) {
    const config = configuration || {};
    const existingTasks = {};

    [
      ['checkFileNames', 'check-file-names'],
      ['eslint'],
      ['jest'],
      ['jscs'],
      ['jsdoc'],
      ['nsp'],
      ['retire'],
      ['webpack']
    ].forEach(task => {
      if (config[task[0]] === false) {
        return;
      }

      const taskName = task[1] || task[0];
      let taskConfig = config[task[0]];
      if (!taskConfig || taskConfig === true) {
        taskConfig = defaults[task[0]];
      } else if (typeof taskConfig === 'object' && !Array.isArray(taskConfig)) {
        // using assign instead of deep merge (defaults are exposed)
        // to be able to override defaults easily
        taskConfig = Object.assign({}, defaults[task[0]], taskConfig);
      }

      tasks[task[0]].register(gulp, taskName, taskConfig);
      existingTasks[taskName] = true;
    });

    const filter = val => val.filter(task => existingTasks.hasOwnProperty(task));

    gulp.task('dist', filter(['webpack']));

    gulp.task('doc', filter(['jsdoc']));

    gulp.task('test', filter(['jest']));

    gulp.task('analyse', filter(['check-file-names', 'jscs', 'eslint', 'nsp', 'retire']));

    gulp.task('pre-commit', ['analyse', 'test']);

    gulp.task('pre-release', ['pre-commit', 'dist', 'doc']);
  },

  /**
   * Overwrites global configurations
   * @see module:main.globals
   * @param {Object} configuration
   * @param {Object} configuration.babel
   */
  setGlobalConfiguration(configuration) {
    const unknownGlobals = Object.keys(configuration)
      .filter(key => !globals.hasOwnProperty(key));

    if (unknownGlobals.length) {
      throw new Error('Unknown globals: ' + unknownGlobals.join(', '));
    }

    Object.assign(globals, configuration);
  }

};
