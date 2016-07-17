'use strict';

const babel = require('./babel');
const checkDependencies = require('./check-dependencies');
const checkFileNames = require('./check-file-names');
const eslint = require('./eslint');
const jest = require('./jest');
const jscs = require('./jscs');
const jsdoc = require('./jsdoc');
const mocha = require('./mocha');
const npmInstall = require('./npm-install');
const nsp = require('./nsp');
const retire = require('./retire');
const tslint = require('./tslint');
const webpack = require('./webpack');

/**
 * @module tasks
 * @description Core gulp tasks
 *
 * @property {module:tasks/babel} babel Transpiler
 * @property {module:tasks/checkDependencies} checkDependencies Validator for checking
 *                                                              missing, unused, outdated
 *                                                              dependencies
 * @property {module:tasks/checkFileNames} checkFileNames Validator for checking file names
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
