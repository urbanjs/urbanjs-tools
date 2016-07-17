'use strict';

const _ = require('lodash');
const fs = require('../../utils/helper-fs');
const npmInstall = require('../npm-install');
const pkg = require('../../../package.json');
const shell = require('gulp-shell');
const configHelper = require('../../utils/helper-config');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals, processOptionPrefix) {
  const defaults = require('./defaults');

  if (!globals.babel) {
    globals.babel = require('../../utils/global-babel'); // eslint-disable-line
  }

  if (!globals.typescript) {
    globals.typescript = require('../../utils/global-typescript'); // eslint-disable-line
  }

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

function getJSDocParameters(configFilePath) {
  return fs.readFile(configFilePath)
    .then(content => JSON.parse(content))
    .catch(e => {
      console.log('Config file cannot be found/parsed'); // eslint-disable-line no-console
      throw e;
    });
}

/**
 * @module tasks/jsdoc
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'jsdoc'
    ].concat(
      dependencyHelper.babelConfig,
      dependencyHelper.transpileHelper
    )
  ),

  /**
   * @function
   * @description This task is responsible for generating the API documentation.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jsdoc.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jsdoc',
   *   {
   *     configFile: require('path').join(__dirname + '.jsdocrc'),
   *     packagePath: path.join(require.resolve('jsdoc/jsdoc'), '../')
   *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    const cleanUpTaskName = `${taskName}-clean`;
    gulp.task(cleanUpTaskName, [installDependenciesTaskName], (done) => {
      const config = buildConfig(parameters, globals, taskName);
      getJSDocParameters(config.configFile)
        .then(jsdocParameters => {
          const outputPath = _.get(jsdocParameters, 'opts.destination');
          if (!outputPath) {
            throw new Error('Config file need to define the output folder');
          }

          return fs.remove(outputPath);
        })
        .then(() => done())
        .catch(done);
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], done => {
      const config = buildConfig(parameters, globals, taskName);
      shell.task([
        `node "${config.packagePath}jsdoc.js" -c "${config.configFile}"`
      ], { quiet: true, env: { urbanJSToolGlobals: JSON.stringify(globals) } })(done);
    });
  }
};
