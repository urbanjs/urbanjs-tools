'use strict';

const yargs = require('yargs');

yargs
  .help('h')
  .alias('h', 'help')
  .showHelpOnFail(false, 'Specify --help for available options')
  .version(() => require('../../package.json').version)
  .alias('v', 'version')
  .strict()
  .command('generate', 'Generates a skeleton for your next project', require('./generate'))
  .usage('Usage: urbanjs <command>')
  .parse(process.argv.slice(2));

if (process.argv.length < 3) {
  yargs.showHelp();
}
