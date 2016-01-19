/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/checkFileNames
 * @see https://github.com/HAKASHUN/gulp-check-file-naming-convention#optionscase
 * @property {string|string[]} [upperCase] Paths of files to validate against upperCase naming convention
 * @property {string|string[]} [upperCaseFirst] Paths of files to validate against upperCaseFirst naming convention
 * @property {string|string[]} [lowerCase] Paths of files to validate against lowerCase naming convention
 * @property {string|string[]} [sentenceCase] Paths of files to validate against sentenceCase naming convention
 * @property {string|string[]} [titleCase] Paths of files to validate against titleCase naming convention
 * @property {string|string[]} [camelCase] Paths of files to validate against camelCase naming convention
 * @property {string|string[]} [pascalCase] Paths of files to validate against pascalCase naming convention
 * @property {string|string[]} [snakeCase] Paths of files to validate against snakeCase naming convention
 * @property {string|string[]} [paramCase] Paths of files to validate against paramCase naming convention
 * @property {string|string[]} [dotCase] Paths of files to validate against dotCase naming convention
 * @property {string|string[]} [pathCase] Paths of files to validate against pathCase naming convention
 * @property {string|string[]} [constantCase] Paths of files to validate against constantCase naming convention
 * @property {string|string[]} [swapCase] Paths of files to validate against swapCase naming convention
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/jsdoc
 * @property {string} configFile The path to the jsdoc configuration file
 * @property {string} executablePath The path where jsdoc executable can be found
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/nsp
 * @property {string|string[]} packageFile Path of the package.json file or files
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/jscs
 * @property {string|string[]} files Paths of the files to check
 * @property {string} configFile The path to the jscs configuration file
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/eslint
 * @description ESLint configuration object, can contain any options of the eslint cli engine.
 * @see http://eslint.org/docs/developer-guide/nodejs-api#cliengine
 * @property {string|string[]} files Paths of the files to check
 * @property {string} configFile The path to the eslint configuration file
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/jest
 * @see https://facebook.github.io/jest/docs/api.html#content
 *
 * @property {string} rootDir Configuration of the jest
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/webpack
 * @see https://webpack.github.io/docs/configuration.html
 *
 * @property {Object|Object[]} config Configuration of the webpack
 * @property {boolean} [watch] Whether watching the files as well
 */
