#! /usr/bin/env node

require('../src/cli')
  .run(process.argv.slice(2))
  .catch(function exit() {
    process.exit(1);
  });
