'use strict';

const _ = require('lodash');
const exec = require('child_process').exec;
const fs = require('./lib/fs');
const npmInstall = require('./npm-install');
const path = require('path');
const pkg = require('../package.json');
const prettyjson = require('prettyjson');
const configHelper = require('./lib/helper-config.js');

function buildConfig(parameters, globals) {
  const defaults = require('./check-dependencies-defaults');

  if (globals && globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else if (globals) {
    globals.sourceFiles = defaults.files; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

function show(data, title, color) {
  if (!_.isEmpty(data)) {
    console.log(// eslint-disable-line no-console
      `${title}\n`,
      prettyjson.render(data, {
        keysColor: color || 'black'
      })
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
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function checkOutdatedPackages(packageFile) {
  let outdatedPackages;
  let problematicDependencies;

  return getOutdatedPackages(packageFile)
    .then(packages => {
      // validate only installed dependencies
      outdatedPackages = Object.keys(packages)
        .filter(packageName => typeof packages[packageName].current !== 'undefined');

      // these dependencies are problematic as they have a newer version which is also allowed to
      // be installed according the semver version.
      // Unless you use shrinkwrap file or fix version numbers you should update these
      // dependencies as soon as possible to avoid potential errors of the newer version.
      problematicDependencies = Object.keys(outdatedPackages).filter(packageName => {
        const dependency = outdatedPackages[packageName];
        return dependency.current !== dependency.wanted;
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
      show(outdatedPackages, 'You have outdated packages, consider to update them');
    });
}

function checkMissingPackages(packageFile, files) {
  const depcheck = require('depcheck');
  const options = {
    withoutDev: false,
    ignoreBinPackage: false,
    ignoreMatches: [],
    ignoreDirs: [],
    parsers: [].concat(files).reduce((acc, filePath) => {
      acc[filePath] = [// eslint-disable-line no-param-reassign
        depcheck.parser.jsx,
        depcheck.special.babel,
        depcheck.special.bin,
        depcheck.special.eslint,
        depcheck.special.webpack
      ];
      return acc;
    }, {}),
    detectors: [
      depcheck.detector.requireCallExpression,
      depcheck.detector.importDeclaration
    ],
    specials: []
  };

  return new Promise((resolve, reject) => {
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
}

/**
 * @module tasks/check-dependencies
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'depcheck'
  ]),

  /**
   * @function
   * @description This task is responsible for linting JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/eslint.Parameters} parameters The parameters of the task
   * @param {Object} [globals] The global configuration store of the tasks
   *                           Globals are used to set up defaults
   * @param {string|string[]} globals.sourceFiles Source file paths to validate
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
    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    gulp.task(taskName, [installDependenciesTaskName], done => {
      const config = buildConfig(parameters, globals);

      Promise.all([
        checkOutdatedPackages(config.packageFile),
        checkMissingPackages(config.packageFile, config.files)
      ]).then(() => done(), done);
    });
  }
};
