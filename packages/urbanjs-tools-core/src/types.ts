import {TransformOptions as BabelTransformOptions} from '@types/babel-core';
import {Params as TSCompilerOptions} from '@types/gulp-typescript';

export const TYPE_CONFIG_LOGGER = Symbol('TYPE_CONFIG_LOGGER');
export const TYPE_SERVICE_LOGGER = Symbol('TYPE_SERVICE_LOGGER');
export const TYPE_SERVICE_FILE_SYSTEM = Symbol('TYPE_SERVICE_FILE_SYSTEM');
export const TYPE_SERVICE_SHELL = Symbol('TYPE_SERVICE_SHELL');
export const TYPE_SERVICE_CONFIG = Symbol('TYPE_SERVICE_CONFIG');
export const TYPE_SERVICE_TASK = Symbol('TYPE_SERVICE_TASK');
export const TYPE_SERVICE_CLI_SERVICE = Symbol('TYPE_SERVICE_CLI_SERVICE');
export const TYPE_SERVICE_TRACE = Symbol('TYPE_SERVICE_TRACE');

export type Constructor<T> = new(...args: any[]) => T; //tslint:disable-line

export type CLIServiceOptions = {
  messages: {
    usage: string;
  };
  options: {
    name: string;
    type: string;
    description: string;
    aliases?: string[];
    enum?: string[];
    required?: boolean;
  }[];
  commands: {
    name: string;
    description: string;
  }[];
};

export interface ICLIService {
  parseArgs<T extends {[key: string]: string|number|boolean}>(args: string[], options: CLIServiceOptions): T;
  showHelp(options: CLIServiceOptions): void;
}

export interface IFileSystemService {
  remove(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
}

export type LoggerConfig = {
  debug: boolean;
  info: boolean;
  error: boolean;
  warning: boolean;
};

export type LogMessage = any; //tslint:disable-line

export interface ILoggerService {
  debug(...msgs: LogMessage[]): void;
  error(...msgs: LogMessage[]): void;
  info(...msgs: LogMessage[]): void;
  warn(...msgs: LogMessage[]): void;
}

export interface ITraceService {
  track(target: Object): void;
}

export type GlobalConfiguration = {
  typescript: TSCompilerOptions;
  babel: BabelTransformOptions;
  sourceFiles: string[];
};

export type IToolParameters = {[key: string]: string|number|boolean};

export interface ITool<T extends IToolParameters> {
  register(taskName: string, parameters: T): void;
}

export interface IShellService {
  execute(command: string): Promise<void>;
}

export type TaskDependencies = (string|string[])[];

export interface ITaskService {
  addTask(taskName: string, dependencies: TaskDependencies, handler?: Function): void;
}

export interface IConfigService {
  mergeParameters<T extends IToolParameters>(defaults: T,
                                             parameters: T,
                                             cliOptionPrefix?: string): T;
}
