'use strict';

const mkdir = require('mkdirp').sync;
const path = require('path');
const ncp = require('ncp');
const del = require('del');
const fs = require('fs');
const pkg = require('../package.json');

module.exports = function generate(yargs) {
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
    .argv;

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

  mkdir(folderPath);

  [
    { path: '.editorconfig' },
    { path: '.gitignore' },
    { path: '.npmignore' },
    { path: 'docs', options: { filter: /docs(.+__fixtures__.*)?$/ } }
  ].forEach(source => {
    ncp(
      path.join(__dirname, '../', source.path),
      path.join(folderPath, source.path),
      source.options || {},
      err => {
        if (err) {
          console.error(// eslint-disable-line no-console
            `Unable to initialize \`${source}\` in the target directory.`
          );

          process.on('exit', () => process.exit(1));
        }
      }
    );
  });

  const packageJSON = {
    name: argv.name,
    version: '0.1.0',
    main: 'dist/index.js',
    scripts: pkg.scripts,
    devDependencies: {
      // TODO: fix it to be able to remove these dependencies
      // babel-core tries to find the preset around the folder of the source file
      // and cannot be changed yet, YAY...
      'babel-preset-es2015': pkg.dependencies['babel-preset-es2015'],
      'babel-preset-react': pkg.dependencies['babel-preset-react'],
      'babel-preset-stage-0': pkg.dependencies['babel-preset-stage-0'],

      gulp: pkg.dependencies.gulp
    }
  };
  packageJSON.devDependencies[pkg.name] = '^' + pkg.version;

  fs.writeFile(
    path.join(folderPath, 'package.json'),
    JSON.stringify(packageJSON, null, '  '),
    err => {
      if (err) {
        console.error(// eslint-disable-line no-console
          `Unable to initialize \`package.json\` in the target directory.`
        );

        process.on('exit', () => process.exit(1));
      }
    }
  );

  fs.writeFile(
    path.join(folderPath, 'gulpfile.js'),
    `require('${pkg.name}').initialize(require('gulp'));`,
    err => {
      if (err) {
        console.error(// eslint-disable-line no-console
          `Unable to initialize \`gulpfile.json\` in the target directory.`
        );

        process.on('exit', () => process.exit(1));
      }
    }
  );

  mkdir(path.join(folderPath, 'src'));
  fs.writeFile(
    path.join(folderPath, 'src/index.js'),
    '// let\'s get started...\n',
    err => {
      if (err) {
        console.error(// eslint-disable-line no-console
          `Unable to initialize \`src/index.js\` in the target directory.`
        );

        process.on('exit', () => process.exit(1));
      }
    }
  );

  fs.writeFile(
    path.join(folderPath, 'README.md'),
    `# ${argv.name}\n`,
    err => {
      if (err) {
        console.error(// eslint-disable-line no-console
          `Unable to initialize \`README.md\` in the target directory.`
        );

        process.on('exit', () => process.exit(1));
      }
    }
  );
};
