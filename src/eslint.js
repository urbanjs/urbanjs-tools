'use strict';

const eslint = require('gulp-eslint');
const path = require('path');
const gulpIf = require('gulp-if');

/**
 * @module tasks/eslint
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for linting JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/eslint.Parameters} parameters The parameters of the task
   *
   * @example
   * register(
   *   require('gulp'),
   *   'eslint',
   *   {
    *     configFile: require('path').join(__dirname + '.eslintrc'),
    *     files: require('path').join(__dirname, 'src/*.js')
    *   }
   * );
   */
  register(gulp, taskName, parameters) {
    const validate = (source, fix) => {
      return gulp.src(source)
        .pipe(eslint(Object.assign({}, parameters, {
          fix: !!fix
        })))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
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
                  .pipe(gulpIf(
                    file => file.eslint && file.eslint.fixed,
                    gulp.dest(folderPath)
                  ))
                  .on('error', err => reject(err))
                  .on('end', () => resolve())
                  .on('data', () => {
                  });
              });
            })
          ).then(() => done(), err => done(err));
        });
    });
  }
};
