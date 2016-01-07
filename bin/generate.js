'use strict';

const mkdir = require('mkdirp');
const path = require('path');
const ncp = require('ncp');
const del = require('del');
const fs = require('fs');
const pkg = require('../package.json');

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

  mkdir.sync(folderPath);

  [
    { path: '.editorconfig' },
    { path: 'docs', options: { filter: /docs(.+__fixtures__.*)?$/ } }
  ].forEach(source => {
    ncp(
      path.join(__dirname, '../', source.path),
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
  writeFile(
    path.join(folderPath, 'package.json'),
    JSON.stringify(packageJSON, null, '  ')
  );

  writeFile(
    path.join(folderPath, 'gulpfile.js'),
    `require('${pkg.name}').initialize(require('gulp'));`
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
};
