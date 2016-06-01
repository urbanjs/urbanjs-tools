'use strict';

module.exports = {

  /**
   * Just like gulp-if & ternary-stream but configurable
   */
  streamIf(condition, conditionStream, options) {
    const ForkStream = require('fork-stream');
    const mergeStream = require('merge-stream');
    const through2 = require('through2');
    const duplexify = require('duplexify');

    options = Object.assign({ // eslint-disable-line no-param-reassign
      emitError: true
    }, options);

    const forkStream = new ForkStream({
      classifier: (file, cb) => cb(null, !!condition(file))
    });

    forkStream.a.pipe(conditionStream);

    const mergedStream = mergeStream(forkStream.b, conditionStream);
    const outStream = through2.obj();
    mergedStream.pipe(outStream);

    const duplexStream = duplexify.obj(forkStream, outStream);

    if (options.emitError) {
      conditionStream.on('error', err => duplexStream.emit('error', err));
    }

    return duplexStream;
  }
};
