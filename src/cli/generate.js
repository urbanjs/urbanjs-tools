'use strict';

const del = require('del');
const fs = require('fs');
const mkdir = require('mkdirp');
const path = require('path');
const pkg = require('../../package.json');

function readFileContent(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      return err ? reject(`File cannot be read: ${filePath}`) : resolve(content);
    });
  });
}

function writeContent(targetPath, content) {
  return new Promise((resolve, reject) => {
    const folderPath = path.dirname(targetPath);
    mkdir(folderPath, err => {
      if (err) {
        reject(`Folder cannot be created: ${folderPath}`);
        return;
      }

      fs.writeFile(targetPath, content, writeErr => {
        return writeErr ? reject(`File cannot be written: ${targetPath}`) : resolve();
      });
    });
  });
}

/**
 * @module cli/generate
 */
module.exports = {

  /**
   * Generates the skeleton of the project according to the given arguments.
   * @example
   * Options:
   *  -n or --name  - Required, sets the project & the folder name
   *                  Name can be an absolute path as well
   *  -f or --force - Removes the folder with the given name before the generation
   *  -h or --help  - Shows the manual
   *
   * run(['-n', 'your-awesome-project', '-f']);
   *
   * @param {string[]} args Array of the arguments
   * @param {Object} [yargs] Yargs instance to use
   */
  run(args, yargs) {
    yargs = yargs || require('yargs'); // eslint-disable-line no-param-reassign

    yargs
      .exitProcess(false)
      .showHelpOnFail(false)
      .help('h')
      .alias('h', 'help')
      .strict()
      .options({
        n: {
          alias: 'name',
          type: 'string',
          demand: true,
          description: 'Name of the project & folder'
        },
        f: {
          alias: 'force',
          type: 'boolean',
          description: 'Remove the specified folder if exists'
        }
      })
      .usage('Usage: urbanjs generate -n clean-project -f');

    try {
      const argv = yargs.parse(args);

      if (!argv.name) {
        return Promise.reject(new Error(`The given name is invalid: ${argv.name}`));
      }

      const folderPath = path.isAbsolute(argv.name)
        ? argv.name
        : path.join(process.cwd(), argv.name);

      let generationProcess = Promise.resolve();

      if (argv.force) {
        generationProcess = generationProcess
          .then(() => del(folderPath, { force: true }));
      }

      generationProcess = generationProcess
        .then(() => {
          return new Promise((resolve, reject) => {
            fs.stat(folderPath, err => {
              return err ? resolve() : reject();
            });
          });
        })
        .catch(() => {
          throw new Error([
            `The folder \`${argv.name}\` is existing`,
            argv.force ? ' and cannot be deleted.' : '. Use -f to force to delete it.'
          ].join(''));
        });

      generationProcess = generationProcess
        .then(() => {
          const packageJSON = {
            name: argv.name,
            version: '0.1.0',
            main: 'dist/index.js',
            scripts: pkg.scripts,
            devDependencies: {
              gulp: pkg.devDependencies.gulp
            }
          };
          packageJSON.devDependencies[pkg.name] = '^' + pkg.version;

          return Promise.all([
            readFileContent(path.join(__dirname, '../../.editorconfig'))
              .then(content => writeContent(path.join(folderPath, '.editorconfig'), content)),

            readFileContent(path.join(__dirname, '../../.gitattributes'))
              .then(content => writeContent(path.join(folderPath, '.gitattributes'), content)),

            readFileContent(path.join(__dirname, '__skeleton__/npmignore'))
              .then(content => writeContent(path.join(folderPath, '.npmignore'), content)),

            readFileContent(path.join(__dirname, '__skeleton__/gitignore'))
              .then(content => writeContent(path.join(folderPath, '.gitignore'), content)),

            readFileContent(path.join(__dirname, '__skeleton__/gulpfile'))
              .then(content => writeContent(path.join(folderPath, 'gulpfile.js'), content)),

            readFileContent(path.join(__dirname, '../../docs/__fixtures__/static/main.css'))
              .then(content => writeContent(path.join(folderPath, 'docs/__fixtures__/static/main.css'), content)),

            readFileContent(path.join(__dirname, '../../docs/__fixtures__/layout.html'))
              .then(content => writeContent(path.join(folderPath, 'docs/__fixtures__/layout.html'), content)),

            writeContent(path.join(folderPath, 'docs/main.js'), '// write here your custom jsdoc documentation...\n'),

            writeContent(path.join(folderPath, 'package.json'), JSON.stringify(packageJSON, null, '  ')),

            writeContent(path.join(folderPath, 'src/index.js'), '// let\'s get started...\n'),

            writeContent(path.join(folderPath, 'README.md'), `# ${argv.name}\n`)
          ]);
        });

      return generationProcess
        .then(() => {
          console.log('Project skeleton has been successfully generated.'); // eslint-disable-line no-console
        })
        .catch(err => {
          const message = `Project skeleton generation has exited with error: ${err.message}`;
          console.error(message); // eslint-disable-line no-console
          throw err;
        });
    } catch (err) {
      // unexpected error
      return Promise.reject(new Error(err));
    }
  }
};
