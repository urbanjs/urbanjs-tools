'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.setGlobalConfiguration({
  babel: { babelrc: false }
});

tools.tasks.babel.register(gulp, 'babel', true);
