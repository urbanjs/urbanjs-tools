'use strict';

const _ = require('lodash');
const configHelper = require('../../utils/helper-config');
const npmInstall = require('../npm-install');
const path = require('path');
const pkg = require('../../../package.json');
const streamHelper = require('../../utils/helper-stream');
const dependencyStream = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals, processOptionPrefix) {
  const defaults = require('./defaults');

  if (globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else {
    globals.sourceFiles = defaults.files; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

/**
 * @module tasks/tslint
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'gulp-tslint',
      'tslint',
      'tslint-microsoft-contrib',
      'typescript'
    ].concat(
      dependencyStream.streamHelper
    )
  ),

  /**
   * @function
   * @description This task is responsible for linting TS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/tslint.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'tslint',
   *   {
    *     configFile: require('path').join(__dirname + 'tslint.json'),
    *     extensions: ['.ts', 'tsx'],
    *     files: require('path').join(__dirname, 'src/*.ts')
    *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    const validate = config => {
      const tslint = require('gulp-tslint');

      const tslintConfig = {
        rulesDirectory: path.dirname(require.resolve('tslint-microsoft-contrib')),
        configuration: config.configFile
      };

      const extensionRegex = configHelper.getFileExtensionRegExp(config.extensions);
      return gulp.src(config.files)
        .pipe(streamHelper.streamIf(
          file => extensionRegex.test(file.path),
          tslint(tslintConfig)
        ))
        .pipe(streamHelper.streamIf(
          file => extensionRegex.test(file.path),
          tslint.report({ summarizeFailureOutput: true })
        ));
    };

    gulp.task(
      taskName,
      [installDependenciesTaskName],
      () => validate(buildConfig(parameters, globals, taskName))
    );
  }
};
