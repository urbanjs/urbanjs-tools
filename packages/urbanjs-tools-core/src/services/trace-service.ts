import {inject, injectable} from 'inversify';
import {TAG_TRACK} from '../decorators';
import {
  ILoggerService,
  TYPE_SERVICE_LOGGER,
  LogMessage,
  ITraceService
} from '../types';

@injectable()
export class TraceService implements ITraceService {
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService) {
    this.loggerService = loggerService;
  }

  public track(target: { name: string }) {
    const prototype = Object.getPrototypeOf(target);
    const className = prototype.constructor.name;
    const createDebugger = (prefix: LogMessage) => (...args: LogMessage[]) => this.loggerService.debug(prefix, ...args);

    Object.keys(prototype).forEach(propertyName => {
      if (Reflect.getMetadata(TAG_TRACK, target, propertyName)) {
        const debug = createDebugger(`${className}.${propertyName}`);
        const oldMethod = target[propertyName];

        target[propertyName] = function tracked(...args: any[]) {//tslint:disable-line
          const messages = ['called'];
          if (args.length) {
            messages.push('with');
            messages.push(...args.reduce((acc, item) => acc.concat('\n', item), []));
          }

          debug(...messages);
          return oldMethod.apply(this, args);
        };
      }
    });
  }
}
