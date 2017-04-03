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

export default Logger;
