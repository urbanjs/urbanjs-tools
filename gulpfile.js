'use strict';

require('./gulp/generate-package-files');

const chalk = require('chalk');
const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.initializeTasks(gulp, {
  retire: true,
  nsp: true
});

gulp.task('pre-release', ['generate-package-files', 'retire', 'nsp'], (done) => {
  // disable progress bar
  const lernaProgressBar = require("lerna/lib/progressBar");
  lernaProgressBar.tick = () => {
  };

  // filter debug messages
  let semafor = 0;
  const lernaLogger = require("lerna/lib/logger");
  lernaLogger._formatValue = (arg) => typeof arg === 'string' ? arg : '';
  lernaLogger._emit = (message) => {
    // allow not debug messages
    if (message.slice(0, 5) !== '\u001b[94m') {
      console.log(message);
    }

    const index = message.indexOf('> gulp pre-release');
    if (index > 0 && /NpmUtilities\.runScriptInDir/.test(message)) {
      console.log(chalk[semafor++ % 2 ? 'gray' : 'cyan'](message.slice(index)));
    }

    if (/Successfully bootstrapped \d+ packages/.test(message)) {
      done();
    }
  };

  // run bootstrap command
  process.argv = process.argv.slice(0, 2).concat('bootstrap', '--hoist', '--loglevel=verbose');
  require('lerna/bin/lerna');
});
