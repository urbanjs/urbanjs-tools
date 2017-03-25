/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/babel
 * @property {string} outputPath Output path
 * @property {string|string[]} files Paths of the files to build
 * @property {Object} [babel] Common babel configuration
 * @property {boolean|Object} [sourcemap] Sourcemap configuration,
 *                                        see https://www.npmjs.com/package/gulp-sourcemaps
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/checkFileNames
 * @see https://github.com/HAKASHUN/gulp-check-file-naming-convention#optionscase
 * @property {string|string[]} [upperCase] Paths of files to validate
 *                                         against upperCase naming convention
 * @property {string|string[]} [upperCaseFirst] Paths of files to validate
 *                                              against upperCaseFirst naming convention
 * @property {string|string[]} [lowerCase] Paths of files to validate
 *                                         against lowerCase naming convention
 * @property {string|string[]} [sentenceCase] Paths of files to validate
 *                                            against sentenceCase naming convention
 * @property {string|string[]} [titleCase] Paths of files to validate
 *                                         against titleCase naming convention
 * @property {string|string[]} [camelCase] Paths of files to validate
 *                                         against camelCase naming convention
 * @property {string|string[]} [pascalCase] Paths of files to validate
 *                                          against pascalCase naming convention
 * @property {string|string[]} [snakeCase] Paths of files to validate
 *                                         against snakeCase naming convention
 * @property {string|string[]} [paramCase] Paths of files to validate
 *                                         against paramCase naming convention
 * @property {string|string[]} [dotCase] Paths of files to validate
 *                                       against dotCase naming convention
 * @property {string|string[]} [pathCase] Paths of files to validate
 *                                        against pathCase naming convention
 * @property {string|string[]} [constantCase] Paths of files to validate
 *                                            against constantCase naming convention
 * @property {string|string[]} [swapCase] Paths of files to validate
 *                                        against swapCase naming convention
 */

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
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/npmInstall
 *
 * @property {boolean} link Whether to allow linking globally installed, suitable packages.
 * @property {boolean} global Whether to install dependencies globally.
 * @property {boolean} verbose Whether to log additional details.
 * @property {object} dependencies Dependencies to install.
 *                    Key is the name and value is the version of the package.
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/nsp
 * @property {string|string[]} packageFile Path of the package.json file or files
 */

/**
 * @typedef {Object|function} Parameters
 * @memberof module:tasks/retire
 * @see https://www.npmjs.com/package/retire
 *
 * @property {Object|Object[]} config Configuration of the retire
 * @property {string} packagePath The package path to retire
 * @property {string} [options] Options of retire command
 */

/**
 * @typedef {Object|Object[]|function} Parameters
 * @memberof module:tasks/webpack
 * @see https://webpack.github.io/docs/configuration.html
 */
