'use strict';

const globals = {
  babel: {
    presets: [
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-react')
    ],

    plugins: [

      // legacy decorator plugin (this must be the first plugin)
      require.resolve('babel-plugin-transform-decorators-legacy'),

      // stage-0
      require.resolve('babel-plugin-transform-do-expressions'),
      require.resolve('babel-plugin-transform-function-bind'),

      // stage-1 without the decorator plugin
      require.resolve('babel-plugin-transform-class-constructor-call'),
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-export-extensions'),

      // stage-2
      require.resolve('babel-plugin-syntax-trailing-function-commas'),
      require.resolve('babel-plugin-transform-object-rest-spread'),

      // stage-3
      require.resolve('babel-plugin-transform-async-to-generator'),
      require.resolve('babel-plugin-transform-exponentiation-operator'),
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
