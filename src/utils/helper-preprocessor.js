'use strict';

const sourceMaps = {};
let sourceMapSupportInstalled = false;

module.exports = {
  installSourceMapSupport() {
    if (sourceMapSupportInstalled) {
      return;
    }

    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install({
      handleUncaughtExceptions: false,
      retrieveSourceMap: source => {
        const map = sourceMaps[source];
        if (map) {
          return {
            url: null,
            map
          };
        }

        return null;
      }
    });

    sourceMapSupportInstalled = true;
  },

  transpile(src, filename, babelConfig, tsCompilerOptions) {
    const babel = require('babel-core');
    const tsc = require('typescript');
    const gulpTsc = require('gulp-typescript');

    const transformWithBabel = content => {
      const result = babel.transform(content, Object.assign({}, babelConfig, {
        filename,
        ast: false,
        babelrc: false,
        retainLines: true,
        sourceMap: 'both',
        inputSourceMap: sourceMaps[filename]
      }));

      sourceMaps[filename] = result.map;

      return result.code;
    };

    if (filename.indexOf('node_modules') !== -1) {
      // skip node_modules
      return src;
    } else if (/\.tsx?$/.test(filename)) {
      // use gulp-typescript to convert the settings for tsc
      const tsProject = gulpTsc.createProject(Object.assign({}, tsCompilerOptions, {
        typescript: tsc,
        sourceMap: true,
        inlineSourceMap: false,
        declaration: false
      }));

      const result = tsc.transpileModule(src, {
        compilerOptions: tsProject.options,
        fileName: filename
      });

      sourceMaps[filename] = JSON.parse(result.sourceMapText);

      // also use transform with babel to compile to ES5
      // til ES6 is natively supported by most of the environments
      return transformWithBabel(result.outputText);
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
