/**
 * @typedef {Object} Configuration
 * @memberof module:main
 * @property {module:tasks/babel.Parameters} [babel] Parameters of the babel task
 * @property {module:tasks/checkFileNames.Parameters} [checkFileNames] Parameters of the checkFileNames task
 * @property {module:tasks/jsdoc.Parameters} [jsdoc] Parameters of the jsdoc task
 * @property {module:tasks/nsp.Parameters} [nsp] Parameters of the nsp task
 * @property {module:tasks/jscs.Parameters} [jscs] Parameters of the jscs task
 * @property {module:tasks/eslint.Parameters} [eslint] Parameters of the eslint task
 * @property {module:tasks/jest.Parameters} [jest] Parameters of the jest task
 * @property {module:tasks/mocha.Parameters} [mocha] Parameters of the mocha task
 * @property {module:tasks/npmInstall.Parameters} [npmInstall] Parameters of the npmInstall task
 * @property {module:tasks/retire.Parameters} [retire] Parameters of the retire task
 * @property {module:tasks/tslint.Parameters} [tslint] Parameters of the tslint task
 * @property {module:tasks/webpack.Parameters} [webpack] Parameters of the webpack task
 */

/**
 * @typedef {Object} GlobalConfiguration
 * @memberof module:main
 * @property {Object} babel Common babel configuration, used by:
 *                          babel, jest, jsdoc, webpack, check-dependencies, mocha
 * @property {Object} typescript Common typescript compiler configuration, used by:
 *                          babel, jest, jsdoc, check-dependencies, mocha
 * @property {string|string[]} sourceFiles Common source files, used by:
 *                                         eslint, jscs, check-dependencies, check-file-names
 * @property {boolean} allowLinking Whether to allow linking globally installed packages, used by:
 *                                  npm-install
 */
