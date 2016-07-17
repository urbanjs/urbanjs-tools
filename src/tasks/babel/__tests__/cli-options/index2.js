'use strict';

export class Logger {
  constructor(logMethod) {
    this.method = logMethod;
  }

  log(...args) {
    args.forEach(this.method);
  }
}

export class ConsoleLogger extends Logger {
  constructor() {
    super(console.log); // eslint-disable-line no-console
  }
}
