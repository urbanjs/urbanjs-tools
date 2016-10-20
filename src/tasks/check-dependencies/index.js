'use strict';

const _ = require('lodash');
const exec = require('child_process').exec;
const gulpSrc = require('gulp').src;
const fs = require('../../utils/helper-fs');
const npmInstall = require('../npm-install');
const path = require('path');
const pkg = require('../../../package.json');
const prettyjson = require('prettyjson');
const configHelper = require('../../utils/helper-config');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals, processOptionPrefix) {
  const defaults = require('./defaults');

  if (globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else {
    globals.sourceFiles = defaults.files; // eslint-disable-line
  }

  if (!globals.babel) {
    globals.babel = require('../../utils/global-babel'); // eslint-disable-line
  }

  if (!globals.typescript) {
    globals.typescript = require('../../utils/global-typescript'); // eslint-disable-line
  }

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

function show(data, title, color) {
  if (!_.isEmpty(data)) {
    console.log(// eslint-disable-line no-console
      `${title}\n${prettyjson.render(data, { keysColor: color || 'black' })}`
    );
  }
}

function getOutdatedPackages(packageFile) {
  return new Promise((resolve, reject) => {
    exec('npm outdated --json', { cwd: path.dirname(packageFile) }, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        resolve(stdout ? JSON.parse(stdout) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function checkOutdatedPackages(packageFile) {
  let outdatedPackageNames;
  let problematicDependencies;

  return getOutdatedPackages(packageFile)
    .then(packages => {
      // validate only installed dependencies
      outdatedPackageNames = Object.keys(packages)
        .filter(packageName => typeof packages[packageName].current !== 'undefined');

      // these dependencies are problematic as they have a newer version which is also allowed to
      // be installed according the semver version.
      // Unless you use shrinkwrap file or fix version numbers you should update these
      // dependencies as soon as possible to avoid potential errors of the newer version.
      problematicDependencies = outdatedPackageNames.filter(packageName => {
        const dependency = packages[packageName];
        return dependency.current !== dependency.wanted && dependency.wanted !== 'linked';
      });
    })
    .then(() => fs.exists(path.join(path.dirname(packageFile), 'npm-shrinkwrap.json')))
    .then(exists => {
      // shrinkwrap does not exist...
      if (!exists && problematicDependencies.length) {
        show(
          problematicDependencies,
          'You have critical outdated packages:',
          'red'
        );

        throw new Error('critical dependencies');
      }
    })
    .then(() => {
      show(outdatedPackageNames, 'You have outdated packages, consider to update them');
    });
}

function checkMissingPackages(packageFile, files) {
  const depcheck = require('depcheck');
  const parser = require('./depcheck-parser');
  const options = {
    withoutDev: false,
    ignoreBinPackage: false,
    ignoreMatches: [],
    ignoreDirs: [],
    detectors: [
      depcheck.detector.requireCallExpression,
      depcheck.detector.importDeclaration
    ],
    specials: [],
    parsers: {}
  };

  return new Promise((resolve, reject) => {
    gulpSrc(files)
      .on('data', (file) => {
        options.parsers[file.path] = [
          parser,
          depcheck.special.babel,
          depcheck.special.bin,
          depcheck.special.eslint,
          depcheck.special.webpack
        ];
      })
      .on('end', (err) => {
        if (err) {
          reject(new Error('Unable to handle source files.'));
        }

        depcheck(path.dirname(packageFile), options, stats => {
          if (Object.keys(stats.missing).length) {
            show(stats.missing, 'Missing dependencies:', 'red');
            reject(new Error('missing dependencies'));
            return;
          }

          show(stats.dependencies, 'You might have unused dependencies:');
          show(stats.devDependencies, 'You might have unused devDependencies:');
          show(stats.invalidFiles, 'Some of your files are unprocessable:');
          show(stats.invalidDirs, 'Some of your dirs are not accessible:');

          resolve();
        });
      });
  });
}

/**
 * @module tasks/checkDependencies
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies, [
      'babylon',
      'depcheck'
    ].concat(
      dependencyHelper.babelConfig,
      dependencyHelper.transpileHelper
    )
  ),

  /**
   * @function
   * @description This task is responsible for linting JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/eslint.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'check-dependencies',
   *   {
    *     files: require('path').join(__dirname, 'src/*.js')
    *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    gulp.task(taskName, [installDependenciesTaskName], done => {
      const config = buildConfig(parameters, globals, taskName);

      Promise.all([
        checkOutdatedPackages(config.packageFile),
        checkMissingPackages(config.packageFile, config.files)
      ]).then(() => done(), done);
    });
  }
};
