'use strict';

const babel = require('./babel/index');
const checkDependencies = require('./check-dependencies/index');
const checkFileNames = require('./check-file-names/index');
const conventionalChangelog = require('./conventional-changelog/index');
const eslint = require('./eslint/index');
const jest = require('./jest/index');
const jscs = require('./jscs/index');
const jsdoc = require('./jsdoc/index');
const mocha = require('./mocha/index');
const npmInstall = require('./npm-install/index');
const nsp = require('./nsp/index');
const retire = require('./retire');
const tslint = require('./tslint/index');
const webpack = require('./webpack/index');

/**
 * @module tasks
 * @description Core gulp tasks
 *
 * @property {module:tasks/babel} babel Transpiler
 * @property {module:tasks/checkDependencies} checkDependencies Validator for checking
 *                                                              missing, unused, outdated
 *                                                              dependencies
 * @property {module:tasks/checkFileNames} checkFileNames Validator for checking file names
 * @property {module:tasks/conventionalChangelog} conventionalChangelog Changelog generator
 * @property {module:tasks/eslint} eslint JS linter
 * @property {module:tasks/jest} jest Unit tester
 * @property {module:tasks/jsdoc} jsdoc API documentation generator
 * @property {module:tasks/mocha} mocha E2E tester
 * @property {module:tasks/npmInstall} npmInstall Dependency installer
 * @property {module:tasks/nsp} nsp Vulnerability checker
 * @property {module:tasks/retire} retire Vulnerability checker
 * @property {module:tasks/tslint} tslint TS linter
 * @property {module:tasks/webpack} webpack Bundler
 */
module.exports = {
  babel,
  checkDependencies,
  checkFileNames,
  conventionalChangelog,
  eslint,
  jest,
  jscs,
  jsdoc,
  mocha,
  npmInstall,
  nsp,
  retire,
  tslint,
  webpack
};
