export const TYPE_CONFIG_VERSION = Symbol('TYPE_CONFIG_VERSION');
export const TYPE_COMMAND_DEFAULT = Symbol('TYPE_COMMAND_DEFAULT');
export const TYPE_COMMAND_GENERATE = Symbol('TYPE_COMMAND_GENERATE');

export interface ICommand {
  run(rawArgs: string[]): Promise<void>;
}
