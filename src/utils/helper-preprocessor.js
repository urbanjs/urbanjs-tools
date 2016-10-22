'use strict';

const cache = {};
const sourceMaps = {};
let sourceMapSupportInstalled = false;

function transpile(src, filename, babelConfig, tsCompilerOptions) {
  const babel = require('babel-core');
  const tsc = require('typescript');
  const gulpTsc = require('gulp-typescript');

  const transformWithBabel = content => {
    const result = babel.transform(content, Object.assign({}, babelConfig, {
      filename,
      ast: false,
      babelrc: false,
      retainLines: true,
      sourceMap: 'both'
    }));

    sourceMaps[filename] = result.map;

    return result.code;
  };

  if (/\.tsx?$/.test(filename)) {
    // use gulp-typescript to convert the settings for tsc
    const tsProject = gulpTsc.createProject(Object.assign({}, tsCompilerOptions, {
      typescript: tsc,
      sourceMap: false,
      inlineSourceMap: true,
      inlineSources: true,
      declaration: false
    }));

    const result = tsc.transpileModule(src, {
      compilerOptions: tsProject.options,
      fileName: filename
    });

    const inlineSourcemap = new Buffer(result.sourceMapText, 'binary').toString('base64');
    const codeWithInlineSourcemap = result.outputText
      .replace(/\n\/\/# sourceMappingURL[\s\S]+$/, '')
      .concat('\n//# sourceMappingURL=data:application/json;base64,', inlineSourcemap);

    // also use transform with babel to compile to ES5
    // til ES6 is natively supported by most of the environments
    return transformWithBabel(codeWithInlineSourcemap);
  } else if (!babel.util.canCompile(filename)) {
    // You might use a webpack loader in your project
    // that allows you to load custom files (e.g. css, less, scss).
    // Although it is working with webpack but jest
    // don't know how to handle these files.
    // You should never use these files unmocked
    // otherwise you might encounter unexpected behavior.
    // Changing the content of these files
    // to return the raw content.
    return 'module.exports = '.concat(JSON.stringify(src));
  }

  return transformWithBabel(src);
}

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
    // skip node_modules & minified files
    if (filename.indexOf('node_modules') !== -1 || /\.min\.js$/.test(filename)) {
      return src;
    }

    const cacheKey = JSON.stringify({ src, filename, babelConfig, tsCompilerOptions });
    if (!cache[cacheKey]) {
      cache[cacheKey] = transpile(src, filename, babelConfig, tsCompilerOptions);
    }

    return cache[cacheKey];
  }
};
