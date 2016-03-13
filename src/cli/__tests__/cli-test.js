'use strict';

const path = require('path');
const spawn = require('child-process-promise').spawn;
const pkg = require('../../../package.json');

const projectName = 'asd';
const packageFolderPath = path.join(__dirname, '../../../');
const projectFolderPath = path.join(packageFolderPath, projectName);

const toExecutable = executable => process.platform === 'win32' ? `${executable}.cmd` : executable;
const npmExecutable = toExecutable('npm');
const gulpExecutable = toExecutable('gulp');

const run = command => () => {
  const commandString = `${command[0]} ${command[1].join(' ')}`;
  return spawn(command[0], command[1], Object.assign({
    cwd: packageFolderPath,
    capture: ['stdout', 'stderr']
  }, command[2]))
    .then(() => console.log(`${commandString} was successful.`)) // eslint-disable-line no-console
    .catch(err => {
      console.log(`${commandString} has failed`); // eslint-disable-line no-console
      console.log(err.stderr || err.stdout || err); // eslint-disable-line no-console
      throw err;
    });
};

describe('CLI - E2E test', () => {
  const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  pit('full flow', () => {
    const commands = [

      // test generation task
      ['node', ['bin', 'generate', '-n', projectName]],
      ['node', ['bin', 'generate', '-n', projectName], { successfulExitCodes: [1] }],
      ['node', ['bin', 'generate', '-n', projectName, '-f']],

      // install dependencies, use the current repository as urbanjs-tools
      [npmExecutable, ['link']],
      [npmExecutable, ['link', pkg.name], { cwd: projectFolderPath }],
      [npmExecutable, ['install'], { cwd: projectFolderPath }],

      // test each gulp task
      [gulpExecutable, ['check-dependencies'], { cwd: projectFolderPath }],
      [gulpExecutable, ['check-file-names'], { cwd: projectFolderPath }],
      [gulpExecutable, ['eslint'], { cwd: projectFolderPath }],
      [gulpExecutable, ['jest'], { cwd: projectFolderPath }],
      [gulpExecutable, ['jscs'], { cwd: projectFolderPath }],
      [gulpExecutable, ['jsdoc'], { cwd: projectFolderPath }],
      [gulpExecutable, ['nsp'], { cwd: projectFolderPath }],
      [gulpExecutable, ['retire'], { cwd: projectFolderPath, successfulExitCodes: [0, 1] }],
      [gulpExecutable, ['webpack'], { cwd: projectFolderPath }],

      // TODO: test the build with prod dependencies only
      // [npmExecutable, ['unlink', pkg.name]],
      // [npmExecutable, ['uninstall', '--production']],
      ['node', ['dist'], { cwd: projectFolderPath }]
    ];

    let promise = Promise.resolve();
    while (commands.length) {
      promise = promise.then(run(commands.shift()));
    }

    return promise;
  });
});
