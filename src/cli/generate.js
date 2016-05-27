'use strict';

const fs = require('../utils/helper-fs');
const path = require('path');
const pkg = require('../../package.json');
const yargsHelper = require('../utils/helper-yargs');

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
    yargs = yargsHelper.initYargs(yargs) // eslint-disable-line no-param-reassign
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
        },
        t: {
          alias: 'type',
          type: 'string',
          choices: ['js', 'javascript', 'ts', 'typescript'],
          description: 'The type of the sourcecode'
        }
      })
      .usage('Usage: urbanjs generate -n clean-project -f');

    let force;
    let projectName;
    let folderPath;
    let isTsProject;

    return yargsHelper.parseArgs(yargs, args)
      .then(argv => {
        force = argv.force;
        isTsProject = argv.type === 'ts' || argv.type === 'typescript';
        projectName = argv.name;
        folderPath = path.join(process.cwd(), projectName);

        if (path.isAbsolute(projectName)) {
          folderPath = projectName;
          projectName = path.basename(projectName);
        }

        if (!projectName) {
          throw new Error(`The given name is invalid: ${argv.name}`);
        }
      })
      .then(() => force && fs.remove(folderPath))
      .then(() => fs.exists(folderPath))
      .then(exists => {
        if (exists) {
          throw new Error([
            `The folder \`${folderPath}\` is existing`,
            force ? ' and cannot be deleted.' : '. Use -f to force to delete it.'
          ].join(''));
        }
      })
      .then(() => {
        const packageJSON = {
          name: projectName,
          version: '0.1.0',
          private: true,
          main: 'dist/index.js',
          scripts: pkg.scripts,
          dependencies: {
            // based on the defaults, babel uses babel-plugin-transform-runtime
            // so we need babel-runtime as a production dependency in our project
            'babel-runtime': pkg.devDependencies['babel-runtime']
          },
          devDependencies: {
            gulp: pkg.devDependencies.gulp
          }
        };
        packageJSON.devDependencies[pkg.name] = `^${pkg.version}`;

        return Promise.all([
          fs.writeFile(
            path.join(folderPath, 'docs/main.js'),
            '// write here your custom jsdoc documentation...\n'
          ),

          fs.writeFile(
            path.join(folderPath, 'package.json'),
            JSON.stringify(packageJSON, null, '  ')
          ),

          fs.writeFile(
            path.join(folderPath, `src/index.${isTsProject ? 'ts' : 'js'}`),
            '// let\'s get started...\n'
          ),

          fs.writeFile(
            path.join(folderPath, 'README.md'),
            `# ${projectName}\n`
          ),

          fs.readFile(path.join(__dirname, '../../.editorconfig'))
            .then(content => fs.writeFile(path.join(folderPath, '.editorconfig'), content)),

          fs.readFile(path.join(__dirname, '../../.gitattributes'))
            .then(content => fs.writeFile(path.join(folderPath, '.gitattributes'), content)),

          fs.readFile(path.join(__dirname, '__skeleton__/npmignore'))
            .then(content => fs.writeFile(path.join(folderPath, '.npmignore'), content)),

          fs.readFile(path.join(__dirname, '__skeleton__/gitignore'))
            .then(content => fs.writeFile(path.join(folderPath, '.gitignore'), content)),

          fs.readFile(path.join(__dirname, `__skeleton__/gulpfile-${isTsProject ? 'ts' : 'js'}`))
            .then(content => fs.writeFile(path.join(folderPath, 'gulpfile.js'), content)),

          fs.readFile(path.join(__dirname, '../../docs/__fixtures__/static/main.css'))
            .then(content => fs.writeFile(
              path.join(folderPath, 'docs/__fixtures__/static/main.css'),
              content
            )),

          fs.readFile(path.join(__dirname, '../../docs/__fixtures__/layout.html'))
            .then(content => fs.writeFile(
              path.join(folderPath, 'docs/__fixtures__/layout.html'),
              content
            ))
        ]);
      })
      .then(() => {
        console.log(// eslint-disable-line no-console
          'Project skeleton has been successfully generated.');
      })
      .catch(err => {
        console.error(// eslint-disable-line no-console
          'Project skeleton generation has exited with error:',
          err
        );

        throw err;
      });
  }
};
