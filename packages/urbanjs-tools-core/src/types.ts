import { ChildProcess } from 'child_process';

export const TYPE_CONFIG_LOGGER = 'TYPE_CONFIG_LOGGER';
export const TYPE_SERVICE_LOGGER = 'TYPE_SERVICE_LOGGER';
export const TYPE_SERVICE_FILE_SYSTEM = 'TYPE_SERVICE_FILE_SYSTEM';
export const TYPE_SERVICE_SHELL = 'TYPE_SERVICE_SHELL';
export const TYPE_SERVICE_CONFIG = 'TYPE_SERVICE_CONFIG';
export const TYPE_SERVICE_TASK = 'TYPE_SERVICE_TASK';
export const TYPE_SERVICE_CLI_SERVICE = 'TYPE_SERVICE_CLI_SERVICE';
export const TYPE_SERVICE_TRACE = 'TYPE_SERVICE_TRACE';
export const TYPE_SERVICE_STREAM = 'TYPE_SERVICE_STREAM';
export const TYPE_SERVICE_TRANSPILE = 'TYPE_SERVICE_TRANSPILE';
export const TYPE_TOOL = 'TYPE_TOOL';

export type Constructor<T> = new(...args: any[]) => T; //tslint:disable-line

export type CLIServiceOptions = {
  allowUnknown?: boolean;
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
  parseArgs<T extends {
    [key: string]: string
      | number
      | boolean
  }>(args: string[], options: CLIServiceOptions): T;
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

export interface IStreamService {
  mergeStreams(streamA: NodeJS.ReadWriteStream, streamB: NodeJS.ReadWriteStream): NodeJS.ReadWriteStream;
  streamIf<T>(predicate: (input: T) => boolean,
              stream: NodeJS.ReadWriteStream,
              options: { ignoreError: boolean });
}

export type TSCompilerOptions = Object & { extends?: string };
export type BabelTransformOptions = Object;
export type GlobalConfiguration = {
  typescript?: TSCompilerOptions;
  babel?: BabelTransformOptions;
  sourceFiles?: string[];
  readonly ignoredSourceFiles?: string[];
};

export type ToolParameters = { [key: string]: any }; //tslint:disable-line

export type ToolConfiguration<T extends ToolParameters> = boolean | T | ((defaults: T) => T);

export interface ITool<T extends ToolParameters> {
  register(taskName: string, parameters: ToolConfiguration<T>): void;
}

export type ChildProcessOptions = { env?: Object, cwd?: string };
export type ShellCommandOptions = ChildProcessOptions & {
  allowToFail?: boolean;
  expectToFail?: boolean;
  expectToLog?: RegExp | string | (RegExp | string)[];
};
export type ForkProcessOptions = ChildProcessOptions & {
  silent?: boolean;
};

export type ShellCommandResult = { stdout: string, stderr: string };

export interface IShellService {
  forkProcess(modulePath: string, args?: string[], options?: ForkProcessOptions): ChildProcess;
  runCommand(command: string, options?: ShellCommandOptions): Promise<ShellCommandResult>;
  runCommandsInSequence(commands: (string | ShellCommandOptions)[],
                        options?: ShellCommandOptions): Promise<ShellCommandResult[]>;
}

export type TaskDependencies = (string | string[])[];

export interface ITaskService {
  addTask(taskName: string, dependencies: TaskDependencies, handler?: () => Promise<void>): void;
  runTask(taskName: string): Promise<void>;
}

export interface IConfigService {
  mergeParameters<T extends ToolParameters>(defaults: T,
                                            parameters: ToolConfiguration<T>,
                                            cliOptionPrefix?: string): T;
  getGlobalConfiguration(): GlobalConfiguration;
  setGlobalConfiguration(configuration: ToolConfiguration<GlobalConfiguration>): void;
}

export interface ITranspileService {
  transpile(content: string, filename: string): string;
  installSourceMapSupport();
}
