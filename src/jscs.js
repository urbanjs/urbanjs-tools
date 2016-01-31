'use strict';

const _ = require('lodash');
const npmInstall = require('./npm-install');
const path = require('path');
const pkg = require('../package.json');
const utils = require('./lib/utils');

function buildConfig(parameters, globals) {
  const defaults = require('./jscs-defaults');

  if (globals && globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else if (globals) {
    globals.sourceFiles = defaults.files;
  }

  return utils.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/jscs
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for validating the code style of JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jscs.Parameters} parameters The parameters of the task
   * @param {Object} [globals] The global configuration store of the tasks
   *                           Globals are used to set up defaults
   * @param {string|string[]} globals.sourceFiles Source file paths to validate
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jscs',
   *   {
   *     configFile: require('path').join(__dirname + '.jscsrc'),
   *     files: require('path').join(__dirname, 'src/*.js')
   *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    const installDependenciesTaskName = taskName + '-install-dependencies';
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: _.pick(pkg.devDependencies, [
        'gulp-jscs',
        'jscs-jsdoc'
      ])
    });

    const validate = config => {
      const jscs = require('gulp-jscs');
      return gulp.src(config.files)
        .pipe(jscs(_.omit(config, 'files')))
        .pipe(jscs.reporter());
    };

    gulp.task(taskName, [installDependenciesTaskName], () => {
      return validate(buildConfig(parameters, globals));
    });

    gulp.task(taskName + ':fix', [installDependenciesTaskName], (done) => {
      const filesByFolderPath = {};
      const config = buildConfig(parameters, globals);

      gulp.src(config)
        .on('error', err => done(err))
        .on('data', (file) => {
          const folderPath = path.dirname(file.path);
          filesByFolderPath[folderPath] = filesByFolderPath[folderPath] || [];
          filesByFolderPath[folderPath].push(file.path);
        })
        .on('end', () => {
          Promise.all(
            Object.keys(filesByFolderPath).map(folderPath => {
              return new Promise((resolve, reject) => {
                validate(Object.assign({}, config, {
                  files: filesByFolderPath[folderPath],
                  fix: true
                }))
                  .pipe(gulp.dest(folderPath))
                  .on('error', err => reject(err))
                  .on('end', () => resolve());
              });
            })
          ).then(() => done(), err => done(err));
        });
    });
  }
};
