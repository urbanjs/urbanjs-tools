import {inject, injectable, optional} from 'inversify';
import {
  LogMessage,
  ILoggerService,
  TYPE_CONFIG_LOGGER,
  LoggerConfig
} from '../types';

function to2Digits(value: number): string {
  return `0${value}`.slice(-2);
}

export const TYPE_DRIVER_CHALK = 'TYPE_DRIVER_CHALK';

const COLOR_DEBUG = 'gray';
const COLOR_INFO = 'green';
const COLOR_WARN = 'yellow';
const COLOR_ERROR = 'red';

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
    this.chalk = chalk;

    if (!this.chalk) {
      this.chalk = <IChalk>[COLOR_DEBUG, COLOR_ERROR, COLOR_INFO, COLOR_WARN]
        .reduce((acc, key) => ({...acc, [key]: (str: string) => str}), {});
    }
  }

  public debug(...msgs: LogMessage[]) {
    if (this.loggerConfig.debug) {
      const now = new Date();

      let prefix = `${to2Digits(now.getHours())}:${to2Digits(now.getMinutes())}:${to2Digits(now.getSeconds())}`;
      prefix = `[${this.formatValue(prefix, COLOR_DEBUG)}]`;

      const messages = msgs.map(val => this.formatValue(val, COLOR_DEBUG));
      console.log(prefix, messages[0], ...messages.slice(1)); //tslint:disable-line no-console
    }
  }

  public error(...msgs: LogMessage[]) {
    if (this.loggerConfig.error) {
      const messages = msgs.map(val => this.formatValue(val, COLOR_ERROR));
      console.error(messages[0], ...messages.slice(1)); //tslint:disable-line no-console
    }
  }

  public info(...msgs: LogMessage[]) {
    if (this.loggerConfig.info) {
      const messages = msgs.map(val => this.formatValue(val, COLOR_INFO));
      console.info(messages[0], ...messages.slice(1)); //tslint:disable-line no-console
    }
  }

  public warn(...msgs: LogMessage[]) {
    if (this.loggerConfig.warning) {
      const messages = msgs.map(val => this.formatValue(val, COLOR_WARN));
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
