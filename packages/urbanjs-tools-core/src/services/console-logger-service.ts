import {inject, injectable, optional} from 'inversify';
import {
  LogMessage,
  ILoggerService,
  TYPE_CONFIG_LOGGER,
  LoggerConfig
} from '../types';

function to2Digits(number: number): string {
  return `0${number}`.slice(-2);
}

export const TYPE_DRIVER_CHALK = Symbol('TYPE_DRIVER_CHALK');

export type Colorizer = (str: string) => string;
export interface IChalk {
  green: Colorizer;
  yellow: Colorizer;
  red: Colorizer;
  gray: Colorizer;
}

@injectable()
export class ConsoleLoggerService implements ILoggerService {
  private loggerConfig: LoggerConfig;
  private chalk: IChalk;

  constructor(@inject(TYPE_CONFIG_LOGGER) loggerConfig: LoggerConfig,
              @inject(TYPE_DRIVER_CHALK) @optional() chalk: IChalk) {
    this.loggerConfig = loggerConfig;
    this.chalk = chalk || <IChalk>new Proxy({}, {
        get: () => (str: string) => str
      });
  }

  public debug(...msgs: LogMessage[]) {
    if (this.loggerConfig.debug) {
      const now = new Date();

      let prefix = `${to2Digits(now.getHours())}:${to2Digits(now.getMinutes())}:${to2Digits(now.getSeconds())}`;
      prefix = `[${this.formatValue(prefix, 'gray')}]`;

      const messages = msgs.map(val => this.formatValue(val, 'gray'));
      console.log(prefix, messages[0], ...messages.slice(1)); //tslint:disable-line no-console
    }
  }

  public error(...msgs: LogMessage[]) {
    if (this.loggerConfig.error) {
      const messages = msgs.map(val => this.formatValue(val, 'red'));
      console.error(messages[0], ...messages.slice(1)); //tslint:disable-line no-console
    }
  }

  public info(...msgs: LogMessage[]) {
    if (this.loggerConfig.info) {
      const messages = msgs.map(val => this.formatValue(val, 'green'));
      console.info(messages[0], ...messages.slice(1)); //tslint:disable-line no-console
    }
  }

  public warn(...msgs: LogMessage[]) {
    if (this.loggerConfig.warning) {
      const messages = msgs.map(val => this.formatValue(val, 'yellow'));
      console.warn(messages[0], ...messages.slice(1)); //tslint:disable-line no-console
    }
  }

  private formatValue(value: any, color: keyof IChalk): string { //tslint:disable-line
    if (typeof value === 'function') {
      value = `function ${value.name}() {...}`;
    } else if (value instanceof Error) {
      value = value.stack;
    }

    if (typeof value !== 'string') {
      value = JSON.stringify(value, null, '');
    }

    return this.chalk[color](value);
  }
}
