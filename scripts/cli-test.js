'use strict';

const path = require('path');
const spawn = require('child-process-promise').spawn;
const pkg = require('../package.json');

const projectName = 'asd';
const projectFolderPath = path.join(__dirname, `../${projectName}`);
const packageFolderPath = path.join(__dirname, '../');

const toExecutable = executable => process.platform === 'win32' ? `${executable}.cmd` : executable;
const npmExecutable = toExecutable('npm');
const gulpExecutable = toExecutable('gulp');

const commands = [

  // test generation task
  ['node', ['bin', 'generate', '-n', projectName]],
  ['node', ['bin', 'generate', '-n', projectName], { successfulExitCodes: [1] }],
  ['node', ['bin', 'generate', '-n', projectName, '-f']],

  // install dependencies, use the current repository as urbanjs-tools
  [npmExecutable, ['link'], { cwd: packageFolderPath }],
  [npmExecutable, ['link', pkg.name]],
  [npmExecutable, ['install']],

  // test each gulp task
  [gulpExecutable, ['check-dependencies']],
  [gulpExecutable, ['check-file-names']],
  [gulpExecutable, ['eslint']],
  [gulpExecutable, ['jest']],
  [gulpExecutable, ['jscs']],
  [gulpExecutable, ['jsdoc']],
  [gulpExecutable, ['nsp']],
  [gulpExecutable, ['retire'], { successfulExitCodes: [0, 1] }],
  [gulpExecutable, ['webpack']],

  // TODO: test the build with prod dependencies only
  // [npmExecutable, ['unlink', pkg.name]],
  // [npmExecutable, ['uninstall', '--production']],
  ['node', ['dist']]
];

const run = command => () => {
  const commandString = `${command[0]} ${command[1].join(' ')}`;
  return spawn(command[0], command[1], Object.assign({
    cwd: projectFolderPath,
    capture: ['stdout', 'stderr']
  }, command[2]))
    .then(() => console.log(`${commandString} was successful.`)) // eslint-disable-line no-console
    .catch(err => {
      console.log(`${commandString} has failed`); // eslint-disable-line no-console
      console.log(err.stderr || err.stdout); // eslint-disable-line no-console
      throw err;
    });
};

let promise = Promise.resolve();
while (commands.length) {
  promise = promise.then(run(commands.shift()));
}

promise.catch(err => {
  console.log('Process failed with error:', err); // eslint-disable-line no-console
  promise.exit(1);
});
