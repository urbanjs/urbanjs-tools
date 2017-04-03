'use strict';

export class Logger {
  constructor(logMethod) {
    this.method = logMethod;
  }

  log(...args) {
    args.forEach(this.method);
  }
}

export default Logger;
