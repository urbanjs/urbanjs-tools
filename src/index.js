'use strict';

const globals = require('./index-globals');
const tasks = require('./tasks');
const cliIndexCommand = require('./cli/index');
const cliInstallDependenciesCommand = require('./cli/install-dependencies');
const cliGenerateCommand = require('./cli/generate');

/**
 * @module main
 */
module.exports = {

  /**
   * @type {Object}
   * @description Core cli commands
   *
   * @property {module:cli/index} index Main entry point of the cli
   * @property {module:cli/installDependencies} installDependencies Install npm packages
   * @property {module:cli/generate} generate Generates the folder structure for the project
   */
  cli: {
    index: cliIndexCommand,
    installDependencies: cliInstallDependenciesCommand,
    generate: cliGenerateCommand
  },

  /**
   * @type {module:tasks}
   */
  tasks,

  /**
   * Initializes the given gulp instance with the
   *  core tasks (babel, check-file-names, eslint, jest, jscs, jsdoc, nsp, webpack) and
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
   * require('urbanjs-tools').initialize(require('gulp'), {
   *   jest: false,
   *   eslint: true
   * }));
   *
   * // initialize tasks (overriding defaults)
   * require('urbanjs-tools').initialize(require('gulp'), {
   *   jest: defaults => {
   *     return Object.assign({}, defaults, {unmockedModulePathPatterns: ['core-js/.*']})
   *   }
   * }));
   */
  initialize(gulp, configuration) {
    const config = configuration || {};
    const existingTasks = {};

    [
      ['babel'],
      ['checkDependencies', 'check-dependencies'],
      ['checkFileNames', 'check-file-names'],
      ['eslint'],
      ['jest'],
      ['jscs'],
      ['jsdoc'],
      ['npmInstall', 'npm-install'],
      ['nsp'],
      ['retire'],
      ['tslint'],
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

    gulp.task('dist', filter(['webpack', 'babel']));

    gulp.task('doc', filter(['jsdoc']));

    gulp.task('test', filter(['jest']));

    gulp.task('analyse', filter([
      'check-dependencies',
      'check-file-names',
      'jscs',
      'eslint',
      'nsp',
      'retire',
      'tslint'
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
   * @param {module:main.GlobalConfiguration} configuration
   *
   * @example
   *
   * // Using the default configurations of tasks though slightly change the behaviour:
   * //  - validate all files in the /lib folder by check-file-names, eslint, jscs tasks
   * //  - set babel configuration for jsdoc, jest and webpack tasks
   * //  - enable npm linking from global packages during the dependency installation
   * setGlobalConfiguration({
   *   sourceFiles: './lib/**',
   *   babel: { presets: ['es2015'] },
   *   typescript: require('./tsconfig.json').compilerOptions
   *   allowLinking: true
   * });
   */
  setGlobalConfiguration(configuration) {
    const knownGlobals = {
      allowLinking: true,
      babel: true,
      sourceFiles: true,
      typescript: true
    };

    const unknownGlobals = Object.keys(configuration)
      .filter(key => !knownGlobals.hasOwnProperty(key));

    if (unknownGlobals.length) {
      throw new Error(`Unknown globals: ${unknownGlobals.join(', ')}`);
    }

    Object.assign(globals, configuration);
  }

};
