'use strict';

const _ = require('lodash');
const npmInstall = require('../npm-install');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');

function buildConfig(parameters, processOptionPrefix) {
  const defaults = require('./defaults');

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

/**
 * @module tasks/conventionalChangelog
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'gulp-conventional-changelog'
  ]),

  /**
   * @function
   * @description This task is responsible for generating changelog.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/conventionalChangelog.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'conventional-changelog',
   *   {
   *     changelogFile: path.join(processCwd, 'CHANGELOG.md'),
   *     outputPath: processCwd,
   *     conventionalChangelog: {
   *       preset: 'angular'
   *     }
   *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    gulp.task(
      taskName,
      [installDependenciesTaskName],
      () => {
        const conventionalChangelog = require('gulp-conventional-changelog');
        const config = buildConfig(parameters, taskName);

        return gulp.src(config.changelogFile)
          .pipe(conventionalChangelog(
            config.conventionalChangelog,
            config.context,
            config.gitRawCommits,
            config.conventionalCommitsParser,
            config.conventionalChangelogWriter
          ))
          .pipe(gulp.dest(config.outputPath));
      }
    );
  }
};
