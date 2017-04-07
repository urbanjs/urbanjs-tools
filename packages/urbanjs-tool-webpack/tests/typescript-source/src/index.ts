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
