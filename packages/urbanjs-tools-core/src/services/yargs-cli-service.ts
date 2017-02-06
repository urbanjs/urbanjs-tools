import {Argv as IYargs} from '@types/yargs';
import {inject, injectable} from 'inversify';
import {
  CLIServiceOptions,
  ICLIService,
  ILoggerService,
  TYPE_SERVICE_LOGGER
} from '../types';

export const TYPE_DRIVER_YARGS = Symbol('TYPE_DRIVER_YARGS');

@injectable()
export class YargsCLIService implements ICLIService {
  private yargsDriver: () => IYargs;
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_DRIVER_YARGS) yargsDriver: () => IYargs,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService) {
    this.loggerService = loggerService;
    this.yargsDriver = yargsDriver;
  }

  public parseArgs(rawArgs: string[], options: CLIServiceOptions) {
    this.loggerService.debug('YargsService.parseArgs', JSON.stringify(rawArgs));
    const yargs = this.createYargs(options);

    try {
      return yargs.parse(rawArgs);
    } catch (err) {
      this.loggerService.debug('Error in YargsService.parseArgs', err);
      throw err;
    }
  }

  public showHelp(options: CLIServiceOptions) {
    this.loggerService.debug('YargsService.showHelp');
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
      .usage(options.messages.usage)
      .strict();

    options.commands.forEach(command => {
      yargs.command(command.name, command.description);
    });

    return yargs;
  }
}
