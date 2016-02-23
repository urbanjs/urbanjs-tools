'use strict';

const _ = require('lodash');
const npmInstall = require('./npm-install');
const path = require('path');
const pkg = require('../package.json');
const configHelper = require('./lib/helper-config.js');

function buildConfig(parameters, globals) {
  const defaults = require('./eslint-defaults');

  if (globals && globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else if (globals) {
    globals.sourceFiles = defaults.files; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/eslint
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'babel-eslint',
    'eslint-config-airbnb',
    'eslint-plugin-react',
    'gulp-eslint',
    'gulp-if'
  ]),

  /**
   * @function
   * @description This task is responsible for linting JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/eslint.Parameters} parameters The parameters of the task
   * @param {Object} [globals] The global configuration store of the tasks
   *                           Globals are used to set up defaults
   * @param {string|string[]} globals.sourceFiles Source file paths to validate
   *
   * @example
   * register(
   *   require('gulp'),
   *   'eslint',
   *   {
    *     configFile: require('path').join(__dirname + '.eslintrc'),
    *     files: require('path').join(__dirname, 'src/*.js')
    *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    const validate = config => {
      const eslint = require('gulp-eslint');
      return gulp.src(config.files)
        .pipe(eslint(_.omit(config, 'files')))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
    };

    gulp.task(
      taskName,
      [installDependenciesTaskName],
      () => validate(buildConfig(parameters, globals))
    );

    gulp.task(`${taskName}:fix`, [installDependenciesTaskName], (done) => {
      const gulpIf = require('gulp-if');
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
            Object.keys(filesByFolderPath)
              .map(folderPath => new Promise((resolve, reject) => {
                validate(Object.assign({}, config, {
                  files: filesByFolderPath[folderPath],
                  fix: true
                }))
                  .pipe(gulpIf(
                    file => file.eslint && file.eslint.fixed,
                    gulp.dest(folderPath)
                  ))
                  .on('error', err => reject(err))
                  .on('end', () => resolve())
                  .on('data', () => {
                  });
              }))
          ).then(() => done(), err => done(err));
        });
    });
  }
};
