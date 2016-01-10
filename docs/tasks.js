/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/checkFileNames
 * @see https://github.com/HAKASHUN/gulp-check-file-naming-convention#optionscase
 * @property {string|string[]} [upperCase]
 * @property {string|string[]} [upperCaseFirst]
 * @property {string|string[]} [lowerCase]
 * @property {string|string[]} [sentenceCase]
 * @property {string|string[]} [titleCase]
 * @property {string|string[]} [camelCase]
 * @property {string|string[]} [pascalCase]
 * @property {string|string[]} [snakeCase]
 * @property {string|string[]} [paramCase]
 * @property {string|string[]} [dotCase]
 * @property {string|string[]} [pathCase]
 * @property {string|string[]} [constantCase]
 * @property {string|string[]} [swapCase]
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/jsdoc
 * @property {string} configFile
 * @property {string} executablePath
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/nsp
 * @property {string|string[]} packageFile
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/jscs
 * @property {string} configFile
 * @property {boolean} esnext
 * @property {string|string[]} files
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/eslint
 * @property {string} configFile
 * @property {string|string[]} files
 * @property {Object} [envs]
 * @property {Object} [globals]
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/jest
 * @see https://facebook.github.io/jest/docs/api.html#content
 */

/**
 * @typedef {Object} Parameters
 * @memberof module:tasks/webpack
 * @property {Object|Object[]} config
 * @property {boolean} [watch]
 * @see https://webpack.github.io/docs/configuration.html
 */
