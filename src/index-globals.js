'use strict';

const globals = {
  babel: {
    presets: [
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-stage-0'),
      require.resolve('babel-preset-react')
    ],

    plugins: [
      require.resolve('babel-plugin-transform-runtime')
    ]
  }
};

// allow overwriting globals by environment variables
// useful for shell tasks where globals need to be shared
if (process.env.urbanJSToolGlobals) {
  Object.assign(globals, JSON.parse(process.env.urbanJSToolGlobals));
}

module.exports = {
  get babel() {
    return globals.babel;
  },

  set babel(value) {
    globals.babel = value;
  }
};
