'use strict';

const fs = require('fs');
const path = require('path');
const shell = require('gulp-shell');
const semver = require('semver');

let promise = Promise.resolve();
let missingDependencies = null;

/**
 * Tells whether the package has been installed synchronously
 * @param {string} packageName
 * @param {string} version According to the semver rules
 * @returns {boolean}
 * @private
 */
function missing(packageName, version) {
  const packageFilePath = `node_modules/${packageName}/package.json`;
  const possibleNodeModulesPaths = [process.cwd(), path.join(__dirname, '../')];

  while (possibleNodeModulesPaths.length) {
    const packageFileAbsPath = path.join(possibleNodeModulesPaths.shift(), packageFilePath);
    if (fs.existsSync(packageFileAbsPath)) {
      return !semver.satisfies(require(packageFileAbsPath).version, version);
    }
  }

  return true;
}

/**
 * Runs dependency installations after each other
 * @param {array} dependencies
 * @returns {Promise}
 * @private
 */
function installDependencies(dependencies) {
  if (missingDependencies !== null) {
    missingDependencies = missingDependencies.concat(dependencies);
  } else if (dependencies.length) {
    missingDependencies = dependencies;
    promise = promise.then(() => {
      return new Promise((resolve, reject) => {
        console.log(`Installing missing dependencies...\n${missingDependencies}`); // eslint-disable-line no-console

        shell.task([`npm install ${missingDependencies.join(' ')}`])(err => {
          return err ? reject(err) : resolve();
        });

        missingDependencies = null;
      });
    });
  }

  return promise;
}

/**
 * @module tasks/npmInstall
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for installing the given dependencies.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/npmInstall.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'npmInstall',
   *   {
   *     dependencies: {
   *       urbanjs-tools: '^0.2.5'
   *     }
   *   }
   * );
   */
  register(gulp, taskName, parameters) {
    gulp.task(taskName, done => {
      installDependencies(
        Object.keys(parameters.dependencies)
          .filter(packageName => missing(packageName, parameters.dependencies[packageName]))
          .map(packageName => `${packageName}@${parameters.dependencies[packageName]}`)
      ).then(done, done);
    });
  }
};
