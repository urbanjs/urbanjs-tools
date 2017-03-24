import {inject, injectable} from 'inversify';
import {
  cloneDeep,
  merge
}from 'lodash';
import {
  IConfigService,
  ILoggerService,
  IToolParameters,
  ICLIService,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_CLI_SERVICE,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '../types';
import {track} from '../decorators';

@injectable()
export class ConfigService implements IConfigService {
  private loggerService: ILoggerService;
  private cliService: ICLIService;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_CLI_SERVICE) cliService: ICLIService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.cliService = cliService;
    traceService.track(this);
  }

  /**
   * Merges given configuration with defaults.
   *  - falsy value will be ignored
   *  - function will be called, it should return a valid configuration
   *  - a simple object will be merged
   *  - otherwise the new value will be used
   */
  @track()
  public mergeParameters<T extends IToolParameters>(defaults: T,
                                                    parameters: T|boolean,
                                                    cliOptionPrefix?: string) {

    if (!this.isObject(defaults)) {
      throw new Error(`Invalid arguments: defaults must be an object ${JSON.stringify(defaults)}`);
    }

    let result;
    if (!parameters || parameters === true) {
      result = defaults;
    } else if (Array.isArray(parameters)) {
      result = parameters;
    } else if (this.isObject(parameters)) {
      // using assign instead of deep merge
      // to be able to override values easily
      result = Object.assign({}, defaults, parameters);
    } else if (typeof parameters === 'function') {
      result = parameters(cloneDeep(defaults));
      if (!this.isValidConfig(result)) {
        throw new Error(`Invalid config: ${JSON.stringify(result)}`);
      }
    } else {
      throw new Error(`Invalid arguments: invalid config ${JSON.stringify(parameters)}`);
    }

    if (cliOptionPrefix && this.isObject(result)) {
      result = merge(cloneDeep(result), this.getProcessOptions(cliOptionPrefix));
    }

    return result;
  }

  private isObject(obj: any): boolean {//tslint:disable-line
    return obj && Object.getPrototypeOf(obj) === Object.prototype;
  }

  private isValidConfig(obj: any): boolean {//tslint:disable-line
    return this.isObject(obj) || Array.isArray(obj);
  }

  private getProcessOptions(prefix: string): Object {
    try {
      const rawArgs = process.argv.slice(2);
      const options = {
        messages: {usage: ''},
        options: [],
        commands: []
      };

      return this.cliService.parseArgs(rawArgs, options)[prefix] || {};
    } catch (e) {
      return {};
    }
  }
}
