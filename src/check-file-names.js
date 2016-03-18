'use strict';

const _ = require('lodash');
const npmInstall = require('./npm-install');
const pkg = require('../package.json');
const configHelper = require('./lib/helper-config.js');

function buildConfig(parameters, globals) {
  const defaults = require('./check-file-names-defaults');

  if (globals.sourceFiles) {
    defaults.paramCase = globals.sourceFiles;
  } else {
    globals.sourceFiles = defaults.paramCase; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/checkFileNames
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'gulp-check-file-naming-convention',
    'event-stream'
  ]),

  /**
   * @function
   * @description This task is responsible for validating the project file names
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/checkFileNames.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'check-file-names',
   *   { paramCase: require('path').join(__dirname, 'src/*.js') }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    gulp.task(taskName, [installDependenciesTaskName], () => {// eslint-disable-line
      const checkFileNamingConvention = require('gulp-check-file-naming-convention');
      const mergeStream = require('event-stream').merge;
      const config = buildConfig(parameters, globals);
      const caseNames = Object.keys(config);

      if (caseNames.length) {
        return mergeStream(
          caseNames.map(caseName => gulp.src(config[caseName])
            .pipe(checkFileNamingConvention({ caseName })))
        );
      }
    });
  }
};
