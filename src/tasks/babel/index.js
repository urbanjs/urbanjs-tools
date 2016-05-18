'use strict';

const _ = require('lodash');
const del = require('del');
const npmInstall = require('../npm-install');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config.js');

function buildConfig(parameters, globals) {
  const defaults = require('./defaults');

  if (globals.babel) {
    defaults.babel = globals.babel;
  } else {
    globals.babel = defaults.babel; // eslint-disable-line no-param-reassign
  }

  if (globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else {
    globals.sourceFiles = defaults.files; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/babel
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies, [
    'babel-plugin-transform-runtime',
    'babel-preset-es2015',
    'babel-preset-react',
    'babel-preset-stage-0',
    'gulp-babel',
    'gulp-sourcemaps'
  ]),

  /**
   * @function
   * @description This task is responsible for building the project.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/babel.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'babel',
   *   {
   *     files: require('path').join(__dirname, 'src/*.js'),
   *     outputPath: require('path').join(__dirname, 'dist'),
   *     babel: { presets: ['es2015'] },
   *     sourcemap: { loadMaps: true }
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
      Promise.all(
        [].concat(buildConfig(parameters, globals))
          .map(config => del([config.outputPath], { force: true }))
      ).then(() => done()).catch(e => done(e));
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], () => {
      const config = buildConfig(parameters, globals);
      const sourcemaps = require('gulp-sourcemaps');
      const babel = require('gulp-babel');

      let stream = gulp.src(config.files);
      if (config.sourcemap) {
        stream = stream.pipe(sourcemaps.init(config.sourcemap));
      }

      stream = stream.pipe(babel(config.babel));
      if (config.sourcemap) {
        stream = stream.pipe(sourcemaps.write('.', config.sourcemap));
      }

      stream = stream.pipe(gulp.dest(config.outputPath));
      return stream;
    });

    const watchTaskName = `${taskName}:watch`;
    gulp.task(watchTaskName, [installDependenciesTaskName], done => {
      const config = buildConfig(parameters, globals);
      gulp.watch(config.files, [taskName], done);
    });
  }
};
