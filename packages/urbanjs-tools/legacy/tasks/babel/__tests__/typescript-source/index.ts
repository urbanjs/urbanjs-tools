/**
 * Logger
 */

export interface ILogMethod {
  (message: string): void;
}

export class Logger {
  private method: ILogMethod;

  constructor(logMethod: ILogMethod) {
    this.method = logMethod;
  }

  public log(...args: string[]) {
    args.forEach(this.method);
  }
}

export class ConsoleLogger extends Logger {
  constructor() {
    super(console.log); // eslint-disable-line no-console
  }
}
