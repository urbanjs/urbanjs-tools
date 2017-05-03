export const TYPE_CONFIG_VERSION = 'TYPE_CONFIG_VERSION';
export const TYPE_COMMAND_DEFAULT = 'TYPE_COMMAND_DEFAULT';
export const TYPE_COMMAND_GENERATE = 'TYPE_COMMAND_GENERATE';

export interface ICommand {
  run(rawArgs: string[]): Promise<void>;
}
