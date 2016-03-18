'use strict';

const _ = require('lodash');
const del = require('del');
const npmInstall = require('./npm-install');
const path = require('path');
const pkg = require('../package.json');
const shell = require('gulp-shell');
const configHelper = require('./lib/helper-config.js');

function buildConfig(parameters, globals) {
  const defaults = {
    configFile: path.join(__dirname, '../.jsdocrc'),
    executablePath: path.join(require.resolve('jsdoc/jsdoc'), '../../.bin/')
  };

  if (!globals.babel) {
    globals.babel = require('./lib/global-babel'); // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/jsdoc
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'babel-core',
    'babel-preset-es2015',
    'babel-preset-react',
    'babel-preset-stage-0',
    'jest-cli',
    'jsdoc'
  ]),

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
   *     executablePath: path.join(__dirname, 'node_modules/.bin/')
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
      del(['help'], { force: true }).then(() => {
        done();
      });
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], done => {
      const config = buildConfig(parameters, globals);

      shell.task([
        `"${config.executablePath}jsdoc" -c "${config.configFile}"`
      ], { env: { urbanJSToolGlobals: JSON.stringify(globals) } })(done);
    });
  }
};
