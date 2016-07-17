'use strict';

const configHelper = require('../../utils/helper-config');

/**
 * @module tasks/jscs
 * @private
 */
module.exports = {

  dependencies: {},

  register(gulp, taskName) {
    gulp.task(taskName, configHelper.notAvailableGulpTask('JSCS'));
    gulp.task(`${taskName}:fix`, configHelper.notAvailableGulpTask('JSCS'));
  }
};
