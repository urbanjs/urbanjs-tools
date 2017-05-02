'use strict';

const gulp = require('gulp');
const tools = require('urbanjs-tools');

tools.setGlobalConfiguration({
  babel: {
    babelrc: false
  }
});

tools.tasks.webpack.register(gulp, 'webpack', true);
