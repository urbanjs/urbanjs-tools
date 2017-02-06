'use strict';

// flow syntax is supported by default
type LogMethod = (message:string) => void;

export class Logger {
  constructor(logMethod:LogMethod) {
    this.method = logMethod;
  }

  log(...args:string[]) {
    args.forEach(this.method);
  }
}

export class ConsoleLogger extends Logger {
  constructor() {
    super(console.log); // eslint-disable-line no-console
  }
}
