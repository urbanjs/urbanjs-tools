'use strict';

const fs = require('fs');
const babel = require('babel-core');
const preprocessor = require('../../utils/helper-preprocessor');
const globals = require('../../index-globals');

babel.util.canCompile.EXTENSIONS.concat('.ts', 'tsx').forEach(extension => {
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
