'use strict';

const chalk = require('chalk');
const gulp = require('gulp');
const lernaProgressBar = require('lerna/lib/progressBar');
const lernaLogger = require('lerna/lib/logger');

function disableLernaProgressBar() {
  // disable progress bar
  lernaProgressBar.tick = () => {
  };
}

function addFilterForLernaDebugMessages() {
  // overwrite _formatValue not to JSON.stringify everything automatically
  lernaLogger._formatValue = arg => // eslint-disable-line no-underscore-dangle
    (typeof arg === 'string' ? arg : '');

  let counter = 0;
  const debugMessageRegex = /^[A-z]+\.[A-z]+\s*?\(/;
  const debugColorPrefix = '\u001b[34m';
  const debugColorPrefixOnWindows = '\u001b[94m';
  const debugColorPrefixes = [debugColorPrefix, debugColorPrefixOnWindows];
  lernaLogger._emit = (message) => { // eslint-disable-line no-underscore-dangle
    // allow not debug messages
    if (!debugMessageRegex.test(message)
      && debugColorPrefixes.indexOf(message.slice(0, 5)) === -1) {
      console.log(message); // eslint-disable-line no-console
    }

    const relevantContentIndex = message.indexOf('> gulp pre-release');
    if (relevantContentIndex > 0 && /NpmUtilities\.runScriptInDir/.test(message)) {
      const color = counter++ % 2 ? 'gray' : 'cyan'; // eslint-disable-line no-plusplus
      console.log( // eslint-disable-line no-console
        chalk[color](message.slice(relevantContentIndex)));
    }
  };
}

gulp.task('bootstrap', [], (done) => {
  disableLernaProgressBar();
  addFilterForLernaDebugMessages();

  const oldLernaLogEmitter = lernaLogger._emit; // eslint-disable-line no-underscore-dangle
  lernaLogger._emit = (message) => { // eslint-disable-line no-underscore-dangle
    oldLernaLogEmitter(message);

    // lerna does not provide a way to recognize the end of the command (promise maybe?)
    // so lets use the final message of the process
    if (/Successfully bootstrapped \d+ packages/.test(message)) {
      done();
    }
  };

  process.argv = process.argv.slice(0, 2).concat('bootstrap', '--hoist', '--loglevel=verbose');
  require('lerna/bin/lerna'); // eslint-disable-line global-require
});
