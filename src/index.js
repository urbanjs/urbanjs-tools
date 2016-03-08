'use strict';

const globals = require('./index-globals');
const tasks = {
  checkDependencies: require('./check-dependencies'),
  checkFileNames: require('./check-file-names'),
  eslint: require('./eslint'),
  jest: require('./jest'),
  jscs: require('./jscs'),
  jsdoc: require('./jsdoc'),
  npmInstall: require('./npm-install'),
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
   * @description Core cli commands
   *
   * @property {module:cli/index} index Main entry point of the cli
   * @property {module:cli/generate} generate Generates the folder structure for the project
   */
  cli: {
    index: require('./cli/index'),
    generate: require('./cli/generate')
  },

  /**
   * @type {Object}
   * @description Core tasks
   *
   * @property {module:tasks/checkDependencies} checkDependencies Validator for checking
   *                                                              missing, unused, outdated
   *                                                              dependencies
   * @property {module:tasks/checkFileNames} checkFileNames Validator for checking file names
   * @property {module:tasks/eslint} eslint JS linter
   * @property {module:tasks/jest} jest Unit tester
   * @property {module:tasks/jscs} jscs Code style checker
   * @property {module:tasks/jsdoc} jsdoc API documentation generator
   * @property {module:tasks/npmInstall} npmInstall Dependency installer
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
   * @param {module:main.Configuration} configuration Configuration of the tasks,
   *                                                  true value means that defaults should be used
   *                                                  if false value is given the task won't be
   *                                                  initialized, use function to get the
   *                                                  defaults as first argument
   * @example
   *
   * // initialize tasks (eslint with defaults, disable jest)
   * require('urbanjs-tools').initialize(require('gulp', {
   *   jest: false,
   *   eslint: true
   * }));
   *
   * // initialize tasks (overriding defaults)
   * require('urbanjs-tools').initialize(require('gulp', {
   *   jest: defaults => {
   *     return Object.assign({}, defaults, {unmockedModulePathPatterns: ['core-js/.*']})
   *   }
   * }));
   */
  initialize(gulp, configuration) {
    const config = configuration || {};
    const existingTasks = {};

    [
      ['checkDependencies', 'check-dependencies'],
      ['checkFileNames', 'check-file-names'],
      ['eslint'],
      ['jest'],
      ['jscs'],
      ['jsdoc'],
      ['npmInstall', 'npm-install'],
      ['nsp'],
      ['retire'],
      ['webpack']
    ].forEach(def => {
      const taskId = def[0];
      const taskName = def[1] || taskId;

      if (config.hasOwnProperty(taskId) && config[taskId] !== false) {
        tasks[taskId].register(gulp, taskName, config[taskId], globals);
        existingTasks[taskName] = true;
      }
    });

    const filter = val => val.filter(task => existingTasks.hasOwnProperty(task));

    gulp.task('dist', filter(['webpack']));

    gulp.task('doc', filter(['jsdoc']));

    gulp.task('test', filter(['jest']));

    gulp.task('analyse', filter([
      'check-dependencies',
      'check-file-names',
      'jscs',
      'eslint',
      'nsp',
      'retire'
    ]));

    gulp.task('pre-commit', ['analyse', 'test']);

    gulp.task('pre-release', ['pre-commit', 'dist', 'doc']);
  },

  /**
   * Overwrites global configurations
   * Globals are used by multiple tasks. This settings allows you to
   * keep the common configurations in sync e.g. babel, sourceFiles
   * Globals are used to set up the defaults of the tasks.
   * @see module:main.globals
   * @param {Object} configuration
   * @param {Object} configuration.babel
   * @param {string|string[]} configuration.sourceFiles
   *
   * @example
   *
   * // Using the default configurations of tasks although slightly change the behaviour:
   * //  - validate all files in the /lib folder by check-file-names, eslint, jscs tasks
   * //  - set babel configuration for jsdoc, jest and webpack tasks
   * setGlobalConfiguration({
   *   sourceFiles: './lib/**',
   *   babel: { presets: ['es2015'] }
   * });
   */
  setGlobalConfiguration(configuration) {
    const knownGlobals = {
      allowLinking: true,
      babel: true,
      sourceFiles: true
    };

    const unknownGlobals = Object.keys(configuration)
      .filter(key => !knownGlobals.hasOwnProperty(key));

    if (unknownGlobals.length) {
      throw new Error(`Unknown globals: ${unknownGlobals.join(', ')}`);
    }

    Object.assign(globals, configuration);
  }

};
