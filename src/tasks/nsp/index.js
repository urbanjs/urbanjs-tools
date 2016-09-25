'use strict';

const _ = require('lodash');
const npmInstall = require('../npm-install');
const path = require('path');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');

function buildConfig(parameters, processOptionPrefix) {
  const defaults = require('./defaults');

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

/**
 * @module tasks/nsp
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'nsp'
  ]),

  /**
   * @function
   * @description This task is responsible for validating the used packages against vulnerabilities.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/nsp.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'nsp',
   *   {
   *     packageFile: require('path').join(__dirname + 'package.json')
   *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    gulp.task(taskName, [installDependenciesTaskName], (done) => {
      const nsp = require('nsp');
      const config = buildConfig(parameters, taskName);
      let vulnerabilities = null;
      let i = 0;

      [].concat(config.packageFile).forEach(packageFile => {
        i += 1;

        if (!path.isAbsolute(packageFile)) {
          packageFile = path.join(process.cwd(), packageFile); //eslint-disable-line
        }

        nsp.check({ package: packageFile }, (err, data) => {
          if (err || (data && data.length)) {
            vulnerabilities = vulnerabilities || [];
            vulnerabilities.push(`\r\n${packageFile}:\r\n`);
            vulnerabilities.push(nsp.formatters.summary(err, data));
          }

          i -= 1;
          if (i === 0) {
            done(vulnerabilities && vulnerabilities.join(''));
          }
        });
      });
    });
  }
};
