#! /usr/bin/env node

require('../dist') // eslint-disable-line import/no-unresolved
  .run(process.argv.slice(2))
  .catch(() => {
    process.exit(1);
  });
