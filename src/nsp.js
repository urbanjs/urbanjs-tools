'use strict';

const nsp = require('nsp');

/**
 * @module tasks/nsp
 */
module.exports = {

  /**
   * @param {external:Gulp} gulp
   * @param {string} taskName
   * @param {module:tasks/nsp.Parameters} parameters
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
