import {inject, injectable} from 'inversify';
import {
  ITool,
  IConfigService,
  ILoggerService,
  IShellService,
  ITaskService,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_TASK,
  track,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '@tamasmagedli/urbanjs-tools-core';
import {defaults} from './defaults';
import {RetireConfig} from './types';

@injectable()
export class Retire implements ITool<RetireConfig> {
  private shellService: IShellService;
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_SHELL) shellService: IShellService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.shellService = shellService;
    this.taskService = taskService;
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: RetireConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const config = this.configService.mergeParameters<RetireConfig>(defaults, parameters, taskName);
        const command = `node "${config.packagePath}bin/retire" ${config.options || ''}`;
        await this.shellService.runCommand(command);
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }
}
