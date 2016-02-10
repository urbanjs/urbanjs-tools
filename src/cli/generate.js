'use strict';

const fs = require('../lib/fs');
const path = require('path');
const pkg = require('../../package.json');

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

    let argv;
    try {
      argv = yargs.parse(args);
    } catch (err) {
      // most of the time an unknown option causes this error
      // let's show the help how to use urbanjs correctly
      yargs.showHelp();

      return Promise.reject(err);
    }

    const force = argv.force;
    let projectName = argv.name;
    let folderPath = path.join(process.cwd(), projectName);

    if (path.isAbsolute(projectName)) {
      folderPath = projectName;
      projectName = path.basename(projectName);
    }

    let generationProcess = projectName
      ? Promise.resolve()
      : Promise.reject(new Error(`The given name is invalid: ${argv.name}`));

    if (force) {
      generationProcess = generationProcess
        .then(() => fs.delete(folderPath));
    }

    generationProcess = generationProcess
      .then(() => fs.exists(folderPath))
      .then(exists => {
        if (exists) {
          throw new Error([
            `The folder \`${folderPath}\` is existing`,
            force ? ' and cannot be deleted.' : '. Use -f to force to delete it.'
          ].join(''));
        }
      });

    generationProcess = generationProcess
      .then(() => {
        const packageJSON = {
          name: projectName,
          version: '0.1.0',
          main: 'dist/index.js',
          scripts: pkg.scripts,
          dependencies: {

            // based on the defaults, webpack handles babel-polyfill as external dependency
            // and requires it from node_modules as babel-polyfill can only be used once
            // with this move we can avoid the usage of babel-polyfill multiple times
            // but we can be sure that polyfills are included which our codebase relies on
            'babel-polyfill': pkg.devDependencies['babel-polyfill']
          },
          devDependencies: {
            gulp: pkg.devDependencies.gulp
          }
        };
        packageJSON.devDependencies[pkg.name] = '^' + pkg.version;

        return Promise.all([
          fs.writeFile(path.join(folderPath, 'docs/main.js'), '// write here your custom jsdoc documentation...\n'),

          fs.writeFile(path.join(folderPath, 'package.json'), JSON.stringify(packageJSON, null, '  ')),

          fs.writeFile(path.join(folderPath, 'src/index.js'), '// let\'s get started...\n'),

          fs.writeFile(path.join(folderPath, 'README.md'), `# ${projectName}\n`),

          fs.readFile(path.join(__dirname, '../../.editorconfig'))
            .then(content => fs.writeFile(path.join(folderPath, '.editorconfig'), content)),

          fs.readFile(path.join(__dirname, '../../.gitattributes'))
            .then(content => fs.writeFile(path.join(folderPath, '.gitattributes'), content)),

          fs.readFile(path.join(__dirname, '__skeleton__/npmignore'))
            .then(content => fs.writeFile(path.join(folderPath, '.npmignore'), content)),

          fs.readFile(path.join(__dirname, '__skeleton__/gitignore'))
            .then(content => fs.writeFile(path.join(folderPath, '.gitignore'), content)),

          fs.readFile(path.join(__dirname, '__skeleton__/gulpfile'))
            .then(content => fs.writeFile(path.join(folderPath, 'gulpfile.js'), content)),

          fs.readFile(path.join(__dirname, '../../docs/__fixtures__/static/main.css'))
            .then(content => fs.writeFile(path.join(folderPath, 'docs/__fixtures__/static/main.css'), content)),

          fs.readFile(path.join(__dirname, '../../docs/__fixtures__/layout.html'))
            .then(content => fs.writeFile(path.join(folderPath, 'docs/__fixtures__/layout.html'), content))
        ]);
      });

    return generationProcess
      .then(() => {
        console.log('Project skeleton has been successfully generated.'); // eslint-disable-line no-console
      })
      .catch(err => {
        console.error(// eslint-disable-line no-console
          `Project skeleton generation has exited with error:`,
          err
        );

        throw err;
      });
  }
};
