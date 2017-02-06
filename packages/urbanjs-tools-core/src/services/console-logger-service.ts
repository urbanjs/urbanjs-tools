import {inject, injectable} from 'inversify';
import {
  LogMessage,
  ILoggerService,
  TYPE_CONFIG_LOGGER,
  LoggerConfig
} from '../types';

function to2Digits(number: number): string {
  return `0${number}`.slice(-2);
}

@injectable()
export class ConsoleLoggerService implements ILoggerService {
  private loggerConfig: LoggerConfig;

  constructor(@inject(TYPE_CONFIG_LOGGER) loggerConfig: LoggerConfig) {
    this.loggerConfig = loggerConfig;
  }

  public debug(msg: LogMessage, ...extraMsgs: LogMessage[]) {
    if (this.loggerConfig.debug) {
      const now = new Date();
      const prefix = `[${to2Digits(now.getHours())}:${to2Digits(now.getMinutes())}:${to2Digits(now.getSeconds())}]`;
      console.log(prefix, msg, ...extraMsgs); //tslint:disable-line no-console
    }
  }

  public error(msg: LogMessage, ...extraMsgs: LogMessage[]) {
    if (this.loggerConfig.error) {
      console.error(msg, ...extraMsgs);
    }
  }

  public info(msg: LogMessage, ...extraMsgs: LogMessage[]) {
    if (this.loggerConfig.info) {
      console.info(msg, ...extraMsgs); //tslint:disable-line no-console
    }
  }

  public warn(msg: LogMessage, ...extraMsgs: LogMessage[]) {
    if (this.loggerConfig.warning) {
      console.warn(msg, ...extraMsgs); //tslint:disable-line no-console
    }
  }
}
