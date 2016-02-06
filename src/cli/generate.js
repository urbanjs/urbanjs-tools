'use strict';

const del = require('del');
const fs = require('fs');
const mkdir = require('mkdirp');
const ncp = require('ncp');
const path = require('path');
const pkg = require('../../package.json');

function writeFile(file, content) {
  fs.writeFile(
    file,
    content,
    err => {
      if (err) {
        console.error(// eslint-disable-line no-console
          `Unable to initialize \`${file}\` in the target directory.`
        );

        process.on('exit', () => process.exit(1));
      }
    }
  );
}

module.exports = {

  /**
   * Generates a project skeleton according to the given arguments.
   * @param {string[]} args Array of the arguments
   * @param {Object} [yargs] Optional yargs instance for chainability
   * @private
   */
  run(args, yargs) {
    yargs = yargs || require('yargs')(); // eslint-disable-line

    const argv = yargs
      .help('h')
      .alias('h', 'help')
      .showHelpOnFail(false, 'Specify --help for available options')
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
      .usage('Usage: urbanjs generate -n clean-project -f')
      .parse(args);

    const folderPath = path.join(process.cwd(), argv.name);

    if (argv.force) {
      del.sync(folderPath, { force: true });
    }

    if (fs.existsSync(folderPath)) {
      console.error([// eslint-disable-line no-console
        `The folder \`${argv.name}\` is existing`,
        argv.force ? 'and cannot be deleted.' : '. Use -f to force to delete it.'
      ].join(''));

      process.on('exit', () => process.exit(1));
      return;
    }

    mkdir.sync(folderPath);

    [
      { path: '.editorconfig' },
      { path: '.gitattributes' },
      { path: 'docs', options: { filter: /docs(.+__fixtures__.*)?$/ } }
    ].forEach(source => {
      ncp(
        path.join(__dirname, '../../', source.path),
        path.join(folderPath, source.path),
        source.options || {},
        err => {
          if (err) {
            console.error(// eslint-disable-line no-console
              `Unable to initialize \`${source.path}\` in the target directory.`
            );

            process.on('exit', () => process.exit(1));
          }
        }
      );
    });

    writeFile(
      path.join(folderPath, '.npmignore'),
      fs.readFileSync(path.join(__dirname, '__skeleton__/npmignore'))
    );

    writeFile(
      path.join(folderPath, '.gitignore'),
      fs.readFileSync(path.join(__dirname, '__skeleton__/gitignore'))
    );

    writeFile(
      path.join(folderPath, 'gulpfile.js'),
      fs.readFileSync(path.join(__dirname, '__skeleton__/gulpfile'))
    );

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
    writeFile(
      path.join(folderPath, 'package.json'),
      JSON.stringify(packageJSON, null, '  ')
    );

    mkdir.sync(path.join(folderPath, 'src'));
    writeFile(
      path.join(folderPath, 'src/index.js'),
      '// let\'s get started...\n'
    );

    writeFile(
      path.join(folderPath, 'README.md'),
      `# ${argv.name}\n`
    );
  }
};
