import {ContainerModule, interfaces} from 'inversify';
import {
  TYPE_SERVICE_CLI_SERVICE,
  TYPE_CONFIG_LOGGER,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_TASK,
  TYPE_SERVICE_TRACE,
  TYPE_SERVICE_STREAM,
  TYPE_SERVICE_TRANSPILE
} from './types';
import {
  TranspileService,
  ConfigService,
  ShellService,
  GulpTaskService,
  ConsoleLoggerService,
  FileSystemService,
  YargsCLIService,
  TraceService,
  TYPE_DRIVER_CHILD_PROCESS,
  TYPE_DRIVER_FS,
  StreamService
} from './services';
import * as childProcess from 'child_process';
import * as fs from 'fs';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TYPE_CONFIG_LOGGER).toConstantValue({
    debug: process.env.URBANJS_SILENT !== 'true' && process.env.URBANJS_DEBUG === 'true',
    error: process.env.URBANJS_SILENT !== 'true',
    warning: process.env.URBANJS_SILENT !== 'true',
    info: process.env.URBANJS_SILENT !== 'true'
  });
  bind(TYPE_DRIVER_CHILD_PROCESS).toConstantValue(childProcess);
  bind(TYPE_DRIVER_FS).toConstantValue(fs);
  bind(TYPE_SERVICE_CLI_SERVICE).to(YargsCLIService).inSingletonScope();
  bind(TYPE_SERVICE_LOGGER).to(ConsoleLoggerService).inSingletonScope();
  bind(TYPE_SERVICE_FILE_SYSTEM).to(FileSystemService).inSingletonScope();
  bind(TYPE_SERVICE_CONFIG).to(ConfigService).inSingletonScope();
  bind(TYPE_SERVICE_SHELL).to(ShellService).inSingletonScope();
  bind(TYPE_SERVICE_TASK).to(GulpTaskService).inSingletonScope();
  bind(TYPE_SERVICE_TRACE).to(TraceService).inSingletonScope();
  bind(TYPE_SERVICE_STREAM).to(StreamService).inSingletonScope();
  bind(TYPE_SERVICE_TRANSPILE).to(TranspileService).inSingletonScope();
});
