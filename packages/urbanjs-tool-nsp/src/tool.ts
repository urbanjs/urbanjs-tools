import {inject, injectable} from 'inversify';
import * as nsp from 'nsp';
import {isAbsolute, join} from 'path';
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
import {NspConfig} from './types';

@injectable()
export class Nsp implements ITool<NspConfig> {
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
  public register(taskName: string, parameters: NspConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);
      let hasVulnerability = false;

      try {
        const config = this.configService.mergeParameters<NspConfig>(defaults, parameters, taskName);

        await Promise.all(
          [].concat(config.packageFile).map((packageFile) => {
            if (!isAbsolute(packageFile)) {
              packageFile = join(process.cwd(), packageFile);
            }

            return new Promise((resolve) => {
              nsp.check({package: packageFile}, (err, data) => {
                if (err || (data && data.length)) {
                  this.loggerService.error(`\r\n${packageFile}:\r\n${nsp.formatters.summary(err, data)}`);
                  hasVulnerability = true;
                }

                resolve();
              });
            });
          })
        );
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }

      if (hasVulnerability) {
        throw new Error('Nsp failed');
      }
    });
  }
}
