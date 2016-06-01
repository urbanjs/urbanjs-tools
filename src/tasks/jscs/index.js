'use strict';

const _ = require('lodash');
const npmInstall = require('../npm-install');
const path = require('path');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');
const streamHelper = require('../../utils/helper-stream');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals) {
  const defaults = require('./defaults');

  if (globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else {
    globals.sourceFiles = defaults.files; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/jscs
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'gulp-jscs',
      'jscs-jsdoc'
    ].concat(
      dependencyHelper.streamHelper
    )
  ),

  /**
   * @function
   * @description This task is responsible for validating the code style of JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jscs.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jscs',
   *   {
   *     configFile: require('path').join(__dirname + '.jscsrc'),
   *     extensions: ['.js'],
   *     files: require('path').join(__dirname, 'src/*.js')
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
      const jscs = require('gulp-jscs');

      return gulp.src(config.files)
        .pipe(streamHelper.streamIf(
          file => configHelper.getFileExtensionRegExp(config.extensions).test(file.path),
          jscs({
            configPath: config.configFile,
            fix: !!config.fix
          })))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
    };

    gulp.task(
      taskName,
      [installDependenciesTaskName],
      () => validate(buildConfig(parameters, globals))
    );

    gulp.task(`${taskName}:fix`, [installDependenciesTaskName], (done) => {
      const filesByFolderPath = {};
      const config = buildConfig(parameters, globals);

      gulp.src(config.files)
        .on('error', err => done(err))
        .on('data', (file) => {
          const folderPath = path.dirname(file.path);
          filesByFolderPath[folderPath] = filesByFolderPath[folderPath] || [];
          filesByFolderPath[folderPath].push(file.path);
        })
        .on('end', () => {
          Promise.all(
            Object.keys(filesByFolderPath).map(folderPath => new Promise((resolve, reject) => {
              validate(Object.assign({}, config, {
                files: filesByFolderPath[folderPath],
                fix: true
              }))
                .pipe(gulp.dest(folderPath))
                .on('error', err => reject(err))
                .on('end', () => resolve());
            }))
          ).then(() => done(), err => done(err));
        });
    });
  }
};
