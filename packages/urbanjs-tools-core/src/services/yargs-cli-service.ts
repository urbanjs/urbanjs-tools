import { inject, injectable } from 'inversify';
import {
  CLIServiceOptions,
  ICLIService,
  ILoggerService,
  TYPE_SERVICE_LOGGER,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '../types';
import { track } from '../decorators';

export const TYPE_DRIVER_YARGS = 'TYPE_DRIVER_YARGS';

export type YargsOptions = {
  alias: string;
  describe: string;
  type: string;
  demand?: boolean;
};

export type YargsDriver = {
  parse(...args: any[]): any;
  options(options: { [key: string]: YargsOptions }): YargsDriver;
  showHelpOnFail(enable: boolean, message?: string): YargsDriver;
  exitProcess(enabled: boolean): YargsDriver;
  skipValidation(key: string): YargsDriver;
  usage(message: string, options?: { [key: string]: YargsOptions }): YargsDriver;
  showHelp(consoleLevel?: string): YargsDriver;
  strict(): YargsDriver;
  command(command: string, description: string): YargsDriver;
};

@injectable()
export class YargsCLIService implements ICLIService {
  private yargsDriver: () => YargsDriver;
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_DRIVER_YARGS) yargsDriver: () => YargsDriver,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.yargsDriver = yargsDriver;
    traceService.track(this);
  }

  @track()
  public parseArgs(rawArgs: string[], options: CLIServiceOptions) {
    const yargs = this.createYargs(options);

    try {
      return yargs.parse(rawArgs);
    } catch (err) {
      this.loggerService.debug('Error in YargsService.parseArgs', err);
      throw err;
    }
  }

  @track()
  public showHelp(options: CLIServiceOptions) {
    const yargs = this.createYargs(options);

    // yargs parses automatically the processArgs
    // if the instance parsed nothing yet
    // so let's parse -h to skip the automatic validation process... sigh
    yargs.parse(['-h']);

    yargs.showHelp();
  }

  private createYargs(options: CLIServiceOptions) {
    const yargs = this.yargsDriver()
      .exitProcess(false)
      .showHelpOnFail(false)
      .options({
        h: {
          alias: 'help',
          describe: 'Help',
          type: 'boolean'
        }
      })
      .skipValidation('h')
      .options(
        options.options.reduce(
          (acc, option) => {
            acc[option.name] = {
              describe: option.description,
              type: option.type,
              alias: option.aliases || [],
              demand: option.required || false
            };

            if (option.enum) {
              acc[option.name].choices = option.enum;
            }

            return acc;
          },
          {}
        )
      )
      .usage(options.messages.usage);

    if (!options.allowUnknown) {
      yargs.strict();
    }

    options.commands.forEach(command => {
      yargs.command(command.name, command.description);
    });

    return yargs;
  }
}
