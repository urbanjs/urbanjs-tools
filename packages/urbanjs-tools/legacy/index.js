'use strict';

const _ = require('lodash');
const globals = require('./index-globals');
const tasks = require('./tasks');
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
    const currentSequence = sequence.use(gulp);
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
        presetTasks && presetTasks.length ? currentSequence.apply(null, presetTasks) : []
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
   * Enables in memory transpile just like mocha/jest/babel/webpack tasks do
   */
  setupInMemoryTranspile() {
    module.exports.setGlobalConfiguration();
    require('././mocha/setup-file');
  }
};
