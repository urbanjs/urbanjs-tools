'use strict';

const nsp = require('nsp');

/**
 * @module tasks/nsp
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for validating the used packages against vulnerabilities.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/nsp.Parameters} parameters The parameters of the task
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
  register(gulp, taskName, parameters) {
    gulp.task(taskName, (done) => {
      let vulnerabilities = null;
      let i = 0;

      [].concat(parameters.packageFile).forEach(packageFile => {
        i++;

        nsp.check({ package: packageFile }, (err, data) => {
          if (data && data.length) {
            vulnerabilities = vulnerabilities || [];
            vulnerabilities.push('\r\n' + packageFile + ':\r\n');
            vulnerabilities.push(nsp.formatters.summary(err, data));
          }

          if (--i === 0) {
            done(vulnerabilities && vulnerabilities.join(''));
          }
        });
      });
    });
  }
};
