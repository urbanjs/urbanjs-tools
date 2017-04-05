import {inject, injectable} from 'inversify';
import * as checkFileNamingConvention from 'gulp-check-file-naming-convention';
import * as gulp from 'gulp';
import {
  ITool,
  IConfigService,
  ILoggerService,
  ITaskService,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_TASK,
  track,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '@tamasmagedli/urbanjs-tools-core';
import {CheckFileNamesConfig} from './types';

@injectable()
export class CheckFileNames implements ITool<CheckFileNamesConfig> {
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.taskService = taskService;
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: CheckFileNamesConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const defaults = {paramCase: this.configService.getGlobalConfiguration().sourceFiles};
        const config = this.configService.mergeParameters<CheckFileNamesConfig>(defaults, parameters, taskName);
        const conventionNames = Object.keys(config);

        if (conventionNames.length) {
          await Promise.all(
            conventionNames.map(caseName =>
              new Promise((resolve, reject) => {
                gulp.src(config[caseName])
                  .pipe(checkFileNamingConvention({caseName}))
                  .on('data', () => true)
                  .on('end', () => resolve())
                  .on('error', err => reject(err));
              })
            )
          );
        }
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }
}
