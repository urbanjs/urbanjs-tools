#! /usr/bin/env node

require('../src/cli').run(process.argv.slice(2), require('yargs')());
