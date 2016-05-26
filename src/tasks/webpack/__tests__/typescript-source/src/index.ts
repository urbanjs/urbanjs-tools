interface LogMethod {
  (message:string):void;
}

export class Logger {
  method:LogMethod;

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
