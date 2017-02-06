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
  TYPE_SERVICE_TASK
} from '@tamasmagedli/urbanjs-tools-core';
import {defaults} from './defaults';
import {RetireConfig} from './types';

@injectable()
export class Tool implements ITool<RetireConfig> {
  private shellService: IShellService;
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_SHELL) shellService: IShellService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.shellService = shellService;
    this.taskService = taskService;
  }

  public register(taskName: string, parameters: RetireConfig) {
    const debugPrefix = `RetireTool.register - ${taskName}:`;
    this.loggerService.debug(debugPrefix, 'registering task');

    this.taskService.addTask(taskName, [], async() => {
      this.loggerService.debug(debugPrefix, 'running task');

      try {
        this.loggerService.debug(debugPrefix, 'calculating configuration');
        const config = this.configService.mergeParameters<RetireConfig>(defaults, parameters, taskName);
        this.loggerService.debug(debugPrefix, 'configuration:', config);

        const command = `node "${config.packagePath}bin/retire" ${config.options || ''}`;
        this.loggerService.debug(debugPrefix, 'executing command:', command);
        await this.shellService.execute(command);
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
      }
    });
  }
}
