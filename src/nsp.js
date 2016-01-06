'use strict';

const nsp = require('nsp');

module.exports = {

  /**
   * @param {module:externals.Gulp} gulp
   * @param {module:main.NSPParameters} parameters
   */
  register(gulp, parameters) {
    gulp.task('nsp', (done) => {
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
