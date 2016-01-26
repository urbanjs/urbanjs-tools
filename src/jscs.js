'use strict';

const jscs = require('gulp-jscs');
const path = require('path');

/**
 * @module tasks/jscs
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for validating the code style of JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jscs.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jscs',
   *   {
   *     configFile: require('path').join(__dirname + '.jscsrc'),
   *     files: require('path').join(__dirname, 'src/*.js')
   *   }
   * );
   */
  register(gulp, taskName, parameters) {
    const validate = (source, fix) => {
      return gulp.src(source)
        .pipe(jscs({
          configPath: parameters.configFile,
          fix: !!fix
        }))
        .pipe(jscs.reporter());
    };

    gulp.task(taskName, () => validate(parameters.files));

    gulp.task(taskName + ':fix', (done) => {
      const filesByFolderPath = {};

      gulp.src(parameters.files)
        .on('error', err => done(err))
        .on('data', (file) => {
          const folderPath = path.dirname(file.path);
          filesByFolderPath[folderPath] = filesByFolderPath[folderPath] || [];
          filesByFolderPath[folderPath].push(file.path);
        })
        .on('end', () => {
          Promise.all(
            Object.keys(filesByFolderPath).map(folderPath => {
              return new Promise((resolve, reject) => {
                validate(filesByFolderPath[folderPath], true)
                  .pipe(gulp.dest(folderPath))
                  .on('error', err => reject(err))
                  .on('end', () => resolve());
              });
            })
          ).then(() => done(), err => done(err));
        });
    });
  }
};
