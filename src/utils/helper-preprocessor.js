'use strict';

module.exports = {
  transpile(src, filename, babelConfig, tsCompilerOptions) {
    const babel = require('babel-core');
    const tsc = require('typescript');
    const gulpTsc = require('gulp-typescript');

    const transformWithBabel = content =>
      babel.transform(content, Object.assign({}, babelConfig, {
        filename,
        retainLines: true
      })).code;

    if (filename.indexOf('node_modules') !== -1) {
      // skip node_modules
      return src;
    } else if (/\.tsx?$/.test(filename)) {
      // use gulp-typescript to convert the settings for tsc
      const tsProject = gulpTsc.createProject(Object.assign({}, tsCompilerOptions, {
        inlineSourceMap: true
      }));

      return transformWithBabel(tsc.transpile(src, tsProject.options));
    } else if (!babel.util.canCompile(filename)) {
      // You might use a webpack loader in your project
      // that allows you to load custom files (e.g. css, less, scss).
      // Although it is working with webpack but jest
      // don't know how to handle these files.
      // You should never use these files unmocked
      // otherwise you might encounter unexpected behavior.
      // Changing the content of these files
      // to return the raw content.
      return `module.exports = ${JSON.stringify(src)}`;
    }

    return transformWithBabel(src);
  }
};
