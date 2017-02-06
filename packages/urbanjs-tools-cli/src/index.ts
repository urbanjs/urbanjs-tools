import 'reflect-metadata';
import {container} from './container';
import {
  ILoggerService,
  TYPE_SERVICE_LOGGER
} from '@tamasmagedli/urbanjs-tools-core';
import {
  ICommand,
  TYPE_COMMAND_DEFAULT
} from './types';
import {
  InvalidUsageError,
  CLIError
} from './errors';

export async function run(rawArgs: string[]) {
  const defaultCommand = container.get<ICommand>(TYPE_COMMAND_DEFAULT);
  const loggerService = container.get<ILoggerService>(TYPE_SERVICE_LOGGER);

  try {
    await defaultCommand.run(rawArgs);
  } catch (err) {
    if (err instanceof InvalidUsageError) {
      loggerService.error('Invalid usage of urbanjs cli. Please use --help.');
    } else if (!(err instanceof CLIError)) {
      loggerService.error('Unexpected error', err);
    }

    throw err;
  }
}
