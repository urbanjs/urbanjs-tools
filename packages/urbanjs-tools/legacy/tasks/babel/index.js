'use strict';

const _ = require('lodash');
const fs = require('../../utils/helper-fs');
const npmInstall = require('../npm-install/index');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');
const streamHelper = require('../../utils/helper-stream');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals, processOptionPrefix) {
  const defaults = require('./defaults');

  if (globals.babel) {
    defaults.babel = globals.babel;
  } else {
    globals.babel = defaults.babel; // eslint-disable-line no-param-reassign
  }

  if (!globals.typescript) {
    globals.typescript = require('../../utils/global-typescript'); // eslint-disable-line
  }

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

/**
 * @module tasks/babel
 */
module.exports = {

  dependencies: _.pick(
    pkg.devDependencies,
    [
      'babel-core',
      'gulp-babel',
      'gulp-sourcemaps',
      'gulp-typescript',
      'typescript'
    ].concat(
      dependencyHelper.streamHelper,
      dependencyHelper.babelConfig
    )
  ),

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
    gulp.task(cleanUpTaskName, (done) => {
      const config = buildConfig(parameters, globals, taskName);
      fs.remove(config.outputPath, { force: true }).then(
        () => done(),
        done
      );
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], () => {
      const config = buildConfig(parameters, globals, taskName);
      const sourcemaps = require('gulp-sourcemaps');
      const babel = require('gulp-babel');
      const babelCore = require('babel-core');
      const ts = require('typescript');
      const gulpTs = require('gulp-typescript');
      const mergeStream = require('merge-stream');

      let stream = gulp.src(config.files);
      if (config.sourcemap) {
        stream = stream.pipe(sourcemaps.init(config.sourcemap));
      }

      const tsPipe = gulpTs(Object.assign({}, globals.typescript, {
        typescript: ts,
        inlineSourceMap: true
      }));
      const dtsPipe = tsPipe.dts.pipe(gulp.dest(config.outputPath));

      stream = stream.pipe(streamHelper.streamIf(
        file => /\.tsx?$/.test(file.path),
        tsPipe,
        { emitError: false }
      ));

      stream = stream.pipe(streamHelper.streamIf(
        file => babelCore.util.canCompile(file.path),
        babel(config.babel)
      ));

      if (config.sourcemap) {
        stream = stream.pipe(sourcemaps.write('.', config.sourcemap));
      }

      stream = stream.pipe(gulp.dest(config.outputPath));
      return mergeStream(stream, dtsPipe);
    });

    const watchTaskName = `${taskName}:watch`;
    gulp.task(watchTaskName, [installDependenciesTaskName], (done) => {
      const config = buildConfig(parameters, globals, taskName);
      gulp.watch(config.files, [taskName], done);
    });
  }
};
