import {Container} from 'inversify';
import {
  TYPE_SERVICE_CLI_SERVICE,
  TYPE_CONFIG_LOGGER,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_TASK,
  TYPE_SERVICE_TRACE
}from './types';
import {
  ConfigService,
  ShellService,
  GulpTaskService,
  ConsoleLoggerService,
  FileSystemService,
  YargsCLIService,
  TraceService,
  TYPE_DRIVER_CHILD_PROCESS,
  TYPE_DRIVER_FS
}from './services';
import * as childProcess from 'child_process';
import * as fs from 'fs';

export const container = new Container();

container.bind(TYPE_CONFIG_LOGGER).toConstantValue({
  debug: process.env.URBANJS_DEBUG === 'true',
  error: true,
  warning: true,
  info: true
});
container.bind(TYPE_DRIVER_CHILD_PROCESS).toConstantValue(childProcess);
container.bind(TYPE_DRIVER_FS).toConstantValue(fs);
container.bind(TYPE_SERVICE_CLI_SERVICE).to(YargsCLIService).inSingletonScope();
container.bind(TYPE_SERVICE_LOGGER).to(ConsoleLoggerService).inSingletonScope();
container.bind(TYPE_SERVICE_FILE_SYSTEM).to(FileSystemService).inSingletonScope();
container.bind(TYPE_SERVICE_CONFIG).to(ConfigService).inSingletonScope();
container.bind(TYPE_SERVICE_SHELL).to(ShellService).inSingletonScope();
container.bind(TYPE_SERVICE_TASK).to(GulpTaskService).inSingletonScope();
container.bind(TYPE_SERVICE_TRACE).to(TraceService).inSingletonScope();
