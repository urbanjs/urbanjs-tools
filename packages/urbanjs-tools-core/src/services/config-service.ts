import {inject, injectable} from 'inversify';
import {
  cloneDeep,
  merge
} from 'lodash';
import {
  IConfigService,
  ILoggerService,
  ToolParameters,
  ICLIService,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_CLI_SERVICE,
  ITraceService,
  TYPE_SERVICE_TRACE,
  GlobalConfiguration,
  ToolConfiguration
} from '../types';
import {track} from '../decorators';

@injectable()
export class ConfigService implements IConfigService {
  private loggerService: ILoggerService;
  private cliService: ICLIService;
  private globals: GlobalConfiguration;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_CLI_SERVICE) cliService: ICLIService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.cliService = cliService;
    traceService.track(this);

    this.globals = {
      typescript: {},
      babel: {},
      sourceFiles: []
    };

    // allow overwriting globals by environment variables
    // useful for shell tasks where globals need to be shared
    if (process.env.urbanJSToolGlobals) {
      Object.assign(this.globals, JSON.parse(process.env.urbanJSToolGlobals));
    }
  }

  @track()
  public setGlobalConfiguration(configuration: ToolConfiguration<GlobalConfiguration>) {
    configuration = this.mergeParameters(
      this.globals,
      configuration,
      'global'
    );

    const knownGlobals = {
      allowLinking: true,
      babel: true,
      sourceFiles: true,
      typescript: true
    };

    const unknownGlobals = Object.keys(configuration)
      .filter(key => !knownGlobals.hasOwnProperty(key));

    if (unknownGlobals.length) {
      this.loggerService.error(`Unknown globals: ${unknownGlobals.join(', ')}`);
      throw new Error('Invalid arguments');
    }

    this.globals = configuration;
    process.env.urbanJSToolGlobals = JSON.stringify(this.globals);
  }

  @track()
  public getGlobalConfiguration() {
    return this.globals;
  }

  @track()
  public mergeParameters<T extends ToolParameters>(defaults: T,
                                                   parameters: ToolConfiguration<T>,
                                                   cliOptionPrefix?: string) {
    if (!this.isObject(defaults)) {
      this.loggerService.error(`Invalid arguments: defaults must be an object ${JSON.stringify(defaults)}`);
      throw new Error('Invalid arguments');
    }

    let result;
    if (parameters === true) {
      result = defaults;
    } else if (Array.isArray(parameters)) {
      result = parameters.map(value => Object.assign({}, defaults, value));
    } else if (this.isObject(parameters)) {
      result = Object.assign({}, defaults, parameters);
    } else if (typeof parameters === 'function') {
      result = parameters(cloneDeep(defaults));
      if (!this.isValidConfig(result)) {
        this.loggerService.error(`Invalid result from config function: ${JSON.stringify(result)}`);
        throw new Error('Invalid config');
      }
    } else {
      this.loggerService.error(`Invalid arguments: invalid parameters ${JSON.stringify(parameters)}`);
      throw new Error('Invalid arguments');
    }

    if (cliOptionPrefix) {
      const cliOptions = this.getCLIOptions(cliOptionPrefix);
      if (this.isObject(result)) {
        result = merge(cloneDeep(result), cliOptions);
      } else if (Array.isArray(result)) {
        result = result.map(value => merge(cloneDeep(value), cliOptions));
      }
    }

    return result;
  }

  private isObject(obj: any): boolean {//tslint:disable-line
    return obj && Object.getPrototypeOf(obj) === Object.prototype;
  }

  private isValidConfig(obj: any): boolean {//tslint:disable-line
    return this.isObject(obj) || Array.isArray(obj);
  }

  private getCLIOptions(prefix: string): Object {
    try {
      // TODO
      // process.argv should be injectable
      const rawArgs = process.argv.slice(2);
      const options = {
        allowUnknown: true,
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
