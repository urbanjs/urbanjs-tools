import {inject, injectable} from 'inversify';
import {
  ILoggerService,
  ICLIService,
  CLIServiceOptions,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_CLI_SERVICE
} from '@tamasmagedli/urbanjs-tools-core';
import {
  ICommand,
  TYPE_COMMAND_GENERATE,
  TYPE_CONFIG_VERSION
} from '../../types';
import {InvalidUsageError} from '../../errors';
import {config} from './config';

type ArgsOptions = {
  help: boolean;
  version: boolean;
};

@injectable()
export class DefaultCommand implements ICommand {
  private cliVersion: string;
  private cliService: ICLIService;
  private cliServiceOptions: CLIServiceOptions;
  private loggerService: ILoggerService;
  private commands: { [key: string]: ICommand };

  constructor(@inject(TYPE_SERVICE_CLI_SERVICE) cliService: ICLIService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_COMMAND_GENERATE) generateCommand: ICommand,
              @inject(TYPE_CONFIG_VERSION) cliVersion: string) {
    this.loggerService = loggerService;
    this.cliVersion = cliVersion;
    this.cliService = cliService;
    this.cliServiceOptions = config;

    // TODO
    // consider using a multiInject argument to get all commands and
    // make urbanjs-tools-cli pluginable
    this.commands = {
      generate: generateCommand
    };
  }

  /**
   * Main entry point of the cli, runs the proper command or shows help.
   * @example
   * Commands:
   *  generate        - Builds the skeleton of the project
   *
   * Options:
   *  -h or --help    - Shows the manual
   *  -v or --version - Shows the current version
   *
   * run(['generate', '-n', 'your-awesome-project', '-f']);
   */
  public async run(rawArgs: string[]): Promise<void> {
    const commandName = rawArgs[0];
    if (this.commands.hasOwnProperty(commandName)) {
      const command = this.commands[commandName];
      return command.run(rawArgs.slice(1));
    }

    let args: ArgsOptions;
    try {
      args = this.cliService.parseArgs<ArgsOptions>(rawArgs, this.cliServiceOptions);
    } catch (e) {
      throw new InvalidUsageError();
    }

    if (args.version) {
      this.loggerService.info(this.cliVersion);
      return;
    } else if (args.help) {
      this.cliService.showHelp(this.cliServiceOptions);
      return;
    }

    throw new InvalidUsageError();
  }
}
