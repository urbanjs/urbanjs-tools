'use strict';

const _ = require('lodash');
const globals = require('./index-globals');
const tasks = require('./tasks');
const cliIndexCommand = require('./cli/index');
const cliInstallDependenciesCommand = require('./cli/install-dependencies');
const cliGenerateCommand = require('./cli/generate');
const configHelper = require('./utils/helper-config');
const globalBabel = require('./utils/global-babel');
const globalTypescript = require('./utils/global-typescript');
const globalSourceFiles = require('./utils/global-source-files');
const sequence = require('gulp-sequence');

const presets = {
  changelog: ['conventional-changelog'],
  dist: ['babel', 'webpack'],
  'dist:watch': ['babel:watch', 'webpack:watch'],
  doc: ['jsdoc'],
  test: ['mocha', 'jest'],
  'test:watch': ['mocha:watch', 'jest:watch'],
  analyze: [
    'check-dependencies',
    'check-file-names',
    'jscs',
    'eslint',
    'nsp',
    'retire',
    'tslint'
  ],
  'pre-commit': ['analyze', 'test'],
  'pre-release': ['pre-commit', 'dist', 'doc']
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
   * Initializes the given gulp instance with the core tasks based on the given configuration
   * @param {external:gulp} gulp The gulp instance to initialize
   * @param {module:main.ConfigurationTasks} configuration Configuration of the tasks,
   *                                                  true value means that defaults should be used
   *                                                  if false value is given the task won't be
   *                                                  initialized, use function to get the
   *                                                  defaults as first argument
   * @example
   *
   * // initialize tasks (eslint with defaults, disable jest)
   * require('urbanjs-tools').initializeTasks(require('gulp'), {
   *   jest: false,
   *   eslint: true
   * }));
   *
   * // initialize tasks (overriding defaults)
   * require('urbanjs-tools').initializeTasks(require('gulp'), {
   *   jest: defaults => {
   *     return Object.assign({}, defaults, {unmockedModulePathPatterns: ['core-js/.*']})
   *   }
   * }));
   */
  initializeTasks(gulp, configuration) {
    const config = configuration || {};

    [
      ['babel'],
      ['checkDependencies', 'check-dependencies'],
      ['checkFileNames', 'check-file-names'],
      ['conventionalChangelog', 'conventional-changelog'],
      ['eslint'],
      ['jest'],
      ['jscs'],
      ['jsdoc'],
      ['mocha'],
      ['npmInstall', 'npm-install'],
      ['nsp'],
      ['retire'],
      ['tslint'],
      ['webpack']
    ].forEach((def) => {
      const taskId = def[0];
      const taskName = def[1] || taskId;

      if (config.hasOwnProperty(taskId) && config[taskId] !== false) {
        tasks[taskId].register(gulp, taskName, config[taskId], globals);
      }
    });
  },

  /**
   * Initializes the given gulp instance with the core tasks and presets
   * @param {external:gulp} gulp The gulp instance to initialize
   * @param {module:main.ConfigurationPresets} configuration Configuration of the presets,
   *                                                  true value means default tasks should be used,
   *                                                  if false value is given the preset
   *                                                  is initialized as a noop,
   *                                                  use function to get the default presets
   *                                                  as first argument
   * @example
   *
   * require('urbanjs-tools').initializePresets(require('gulp'), {
   *   changelog: false, // do not initialize this preset
   *   analyse: true,    // initialize analyse preset with the defaults
   *   'pre-release': defaults => defaults.concat(['extra-gulp-task']),
   *   test: ['test-task']
   * }));
   */
  initializePresets(gulp, configuration) {
    const config = configuration || {};
    const defaultPresetsConfig = _.mapValues(presets, val => val.filter((task) => {
      if (!tasks.hasOwnProperty(_.camelCase(task))) {
        return true;
      }

      return gulp.tasks.hasOwnProperty(task.replace(/:.+$/, ''));
    }));

    Object.keys(defaultPresetsConfig).forEach((presetName) => {
      const presetConfig = config[presetName];

      let presetTasks = presetConfig;
      if (presetConfig === true) {
        presetTasks = defaultPresetsConfig[presetName];
      } else if (typeof presetConfig === 'function') {
        presetTasks = presetConfig(defaultPresetsConfig[presetName]);
      }

      gulp.task(
        presetName,
        presetTasks && presetTasks.length ? sequence.apply(null, presetTasks) : []
      );
    });

    gulp.task('analyse', ['analyze']);
  },

  /**
   * Initializes the given gulp instance with the core tasks and presets
   * @param {external:gulp} gulp The gulp instance to initialize
   * @param {module:main.ConfigurationTasks|module:main.ConfigurationPresets} configuration
   * @see initializeTasks & initializePresets methods
   */
  initialize(gulp, configuration) {
    const taskNames = Object.keys(tasks);
    module.exports.initializeTasks(gulp, _.pick(configuration, taskNames));
    module.exports.initializePresets(gulp, _.assign(
      _.mapValues(presets, () => true),
      _.omit(configuration, taskNames)
    ));
  },

  /**
   * Overwrites global configurations
   * Globals are used by multiple tasks. This settings allows you to
   * keep the common configurations in sync e.g. babel, sourceFiles
   * Globals are used to set up the defaults of the tasks.
   * @see module:main.globals
   * @param {module:main.ConfigurationGlobals} configuration
   *
   * @example
   *
   * // Using the default configurations of tasks though slightly change the behaviour:
   * //  - validate all files in the /lib folder by check-file-names, eslint tasks
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
    configuration = configHelper.mergeParameters(// eslint-disable-line no-param-reassign
      Object.assign({
        allowLinking: true,
        babel: globalBabel,
        typescript: globalTypescript,
        sourceFiles: globalSourceFiles
      }, globals),
      configuration,
      'global'
    );

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
  },

  /**
   * Enables in memory transpile just like mocha/jest/babel/webpack tasks do
   */
  setupInMemoryTranspile() {
    module.exports.setGlobalConfiguration();
    require('./tasks/mocha/setup-file');
  }
};
