/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/checkDependencies
 * @property {string|string[]} [files] Paths of the files to check
 * @property {string} packageFile Path of the package.json file or files
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/jsdoc
 * @property {string} configFile The path to the jsdoc configuration file
 * @property {string} packagePath The path to jsdoc package
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/jest
 * @see https://facebook.github.io/jest/docs/api.html#content
 *
 * @property {string} rootDir Configuration of the jest
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/mocha
 * @see https://www.npmjs.com/package/gulp-mocha#api
 *
 * @property {string|string[]} files Paths to the test files
 * @property {number} maxConcurrency
 * @property {boolean} [collectCoverage]
 * @property {string|string[]} [coverageFrom]
 * @property {string} [coverageDirectory]
 * @property {string[]} [coverageReporters]
 * @property {Object} [coverageThresholds]
 * @property {Object} [coverageThresholds.global]
 * @property {Object} [coverageThresholds.each]
 */

/**
 * @typedef {Object|Object[]|function} Parameters
 * @memberof module:tasks/webpack
 * @see https://webpack.github.io/docs/configuration.html
 */
