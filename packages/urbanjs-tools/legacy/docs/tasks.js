/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/checkDependencies
 * @property {string|string[]} [files] Paths of the files to check
 * @property {string} packageFile Path of the package.json file or files
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/conventionalChangelog
 * @property {string} changelogFile Path of the changelog.md file
 * @property {string} outputPath Output path
 * @property {Object} [conventionalChangelog] Conventional changelog options
 * @property {Object} [context] The conventional-changelog options
 * @property {Object} [gitRawCommits] The git-raw commits options
 * @property {Object} [conventionalCommitsParser] The conventional-commits-parser options
 * @property {Object} [conventionalChangelogWriter] The conventional-changelog-writer options
 * @see https://github.com/conventional-changelog/conventional-changelog#api
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/eslint
 * @description ESLint configuration object, can contain any options of the eslint cli engine.
 * @see http://eslint.org/docs/developer-guide/nodejs-api#cliengine
 * @property {string|string[]} files Paths of the files to check
 * @property {string[]} extensions File extensions to validate
 * @property {string} configFile The path to the eslint configuration file
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/tslint
 * @property {string|string[]} files Paths of the files to check
 * @property {string[]} extensions File extensions to validate
 * @property {string} configFile The path to the tslint configuration file
 * @property {string} [formatter] TSLint formatter
 * @see https://github.com/panuhorsmalahti/gulp-tslint#all-default-tslint-options
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
