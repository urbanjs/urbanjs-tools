'use strict';

const gulp = require('gulp');
const path = require('path');
const tools = require('urbanjs-tools');

tools.tasks.jsdoc.register(gulp, 'jsdoc', {
  configFile: path.join(__dirname, 'jsdoc.json'),
  packagePath: path.join(require.resolve('jsdoc/jsdoc'), '../')
});
