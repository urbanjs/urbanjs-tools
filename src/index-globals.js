'use strict';

const globals = {};

// allow overwriting globals by environment variables
// useful for shell tasks where globals need to be shared
if (process.env.urbanJSToolGlobals) {
  Object.assign(globals, JSON.parse(process.env.urbanJSToolGlobals));
}

module.exports = globals;
