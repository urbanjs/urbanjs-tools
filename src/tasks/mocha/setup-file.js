'use strict';

const babel = require('babel-core');
const fs = require('fs');
const globals = require('../../index-globals');
const preprocessor = require('../../utils/helper-preprocessor');

preprocessor.installSourceMapSupport();

babel.util.canCompile.EXTENSIONS.concat('.ts', 'tsx').forEach((extension) => {
  require.extensions[extension] = (module, filename) => {
    module._compile(// eslint-disable-line
      preprocessor.transpile(
        fs.readFileSync(filename, 'utf8'),
        filename,
        globals.babel,
        globals.typescript
      ),
      filename
    );
  };
});
