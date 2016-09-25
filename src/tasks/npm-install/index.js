'use strict';

const _ = require('lodash');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const shell = require('gulp-shell');

let installationPromise = Promise.resolve();
let globalModulePathPromise = null;
let missingDependencies = null;

/**
 * Resolves the returned promise with the global modules path
 * @returns {Promise}
 * @private
 */
function getGlobalModulesPath() {
  if (!globalModulePathPromise) {
    globalModulePathPromise = new Promise((resolve, reject) => {
      // omg npm... is this the only way to get the global node_modules path?!
      // `npm config get prefix` returns the root folder of the npm
      // and not the global node_modules location
      exec('npm list -g --depth=0 -qq npm', (err, stdout) => {
        if (stdout) {
          const match = stdout.match(/.*/); // first line
          if (match && path.isAbsolute(match[0])) {
            resolve(match[0]);
            return;
          }
        }

        reject(new Error('Cannot define the global node modules path.'));
      });
    });
  }

  return globalModulePathPromise;
}

/**
 * Tells whether the package has been installed synchronously
 * @param {string[]} nodeModulesPaths
 * @param {string} packageName Can contain version after @ according to the semver rules
 * @returns {boolean}
 * @private
 */
function missing(nodeModulesPaths, packageName) {
  const packageNameParts = packageName.split('@');
  packageName = packageNameParts[0]; // eslint-disable-line no-param-reassign
  const version = packageNameParts[1];
  const packageFilePath = `node_modules/${packageName}/package.json`;
  const possibleNodeModulesPaths = nodeModulesPaths.slice();

  while (possibleNodeModulesPaths.length) {
    const packageFileAbsPath = path.join(possibleNodeModulesPaths.shift(), packageFilePath);
    if (fs.existsSync(packageFileAbsPath)) {
      return !semver.satisfies(require(packageFileAbsPath).version, version); // eslint-disable-line
    }
  }

  return true;
}

/**
 * Runs dependency installations
 * @param {array} dependencies Names of modules (can contain versions after @)
 * @param {Object} options
 * @param {boolean} options.global
 * @param {boolean} options.link
 * @param {boolean} options.verbose
 * @returns {Promise}
 * @private
 */
function installDependencies(dependencies, options) {
  const config = options || {};
  const verbose = config.verbose;
  const runCommand = command => new Promise((resolve, reject) => {
    shell.task([command], { quiet: !verbose, verbose })(err => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  if (missingDependencies !== null) {
    missingDependencies = _.uniq(missingDependencies.concat(dependencies));
  } else if (dependencies.length) {
    missingDependencies = dependencies;
    installationPromise = installationPromise
      .then(() => {
        if (config.link) {
          return getGlobalModulesPath().catch(e => {
            // it is not critical though we might want to know about it
            console.log(e); // eslint-disable-line no-console
          });
        }

        return null;
      })
      .then(globalModulesPath => {
        console.log(// eslint-disable-line no-console
          `Installing missing dependencies...\n${missingDependencies.join(' ')}`);

        const promises = [];
        let dependenciesToInstall = missingDependencies;
        missingDependencies = null;

        if (config.link && globalModulesPath) {
          let dependenciesToLink = dependenciesToInstall
            .filter(packageName => !missing([globalModulesPath], packageName));

          if (dependenciesToLink.length) {
            dependenciesToInstall = _.difference(dependenciesToInstall, dependenciesToLink);
            dependenciesToLink = dependenciesToLink.map(packageName => packageName.split('@')[0]);
            promises.push(runCommand(`npm link ${dependenciesToLink.join(' ')}`));
          }
        }

        if (dependenciesToInstall.length) {
          promises.push(
            Promise.all(promises).then(() => runCommand(
              `npm install ${dependenciesToInstall.join(' ')} ${config.global ? '-g' : ''}`
            ))
          );
        }

        return Promise.all(promises).then(() => null);
      });
  }

  return installationPromise;
}

/**
 * @module tasks/npmInstall
 */
module.exports = {

  /**
   * @function
   * @param {Object} dependencies
   * @param {Object} options
   * @param {boolean} options.global
   * @param {boolean} options.link
   * @param {boolean} options.verbose
   * @example
   * install({
   *   urbanjs-tools: '^0.2.5'
   * });
   */
  install(dependencies, options) {
    let promise = Promise.resolve();
    let nodeModulePaths = [
      process.cwd(),
      path.join(process.cwd(), 'node_modules/urbanjs-tools')
    ];

    if (options && options.global) {
      promise = promise
        .then(getGlobalModulesPath)
        .then(globalModulesPath => {
          nodeModulePaths = [globalModulesPath];
        });
    }

    return promise.then(() =>
      installDependencies(
        Object.keys(dependencies)
          .map(packageName => `${packageName}@${dependencies[packageName]}`)
          .filter(packageName => missing(nodeModulePaths, packageName)),
        options
      )
    );
  },

  /**
   * @function
   * @description This task is responsible for installing the given dependencies.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/npmInstall.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'npmInstall',
   *   {
   *     verbose: false,
   *     dependencies: {
   *       urbanjs-tools: '^0.2.5'
   *     }
   *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    gulp.task(taskName, done => {
      if (!globals.hasOwnProperty('allowLinking')) {
        globals.allowLinking = true; // eslint-disable-line no-param-reassign
      }

      this.install(
        parameters.dependencies,
        Object.assign({ link: globals.allowLinking }, parameters)
      ).then(done, done);
    });
  }
};
