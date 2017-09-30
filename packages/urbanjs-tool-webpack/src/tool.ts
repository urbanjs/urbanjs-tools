import {inject, injectable} from 'inversify';
import {omit} from 'lodash';
import * as webpack from 'webpack';
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
  TYPE_SERVICE_TRACE,
  IFileSystemService,
  TYPE_SERVICE_FILE_SYSTEM
} from 'urbanjs-tools-core';
import {getDefaults} from './defaults';
import {WebpackConfig} from './types';

@injectable()
export class Webpack implements ITool<WebpackConfig> {
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;
  private fsService: IFileSystemService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_FILE_SYSTEM) fsService: IFileSystemService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.taskService = taskService;
    this.fsService = fsService;
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: WebpackConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const defaults = getDefaults(this.configService.getGlobalConfiguration());
        const config = this.configService.mergeParameters<WebpackConfig>(defaults, parameters, taskName);

        if (config.clean) {
          await Promise.all([].concat(config).map(itemConfig => this.fsService.remove(itemConfig.output.path)));
        }

        await new Promise((resolve, reject) => {
          webpack([].concat(config).map(itemConfig => omit(itemConfig, 'clean'))).run((err, stats) => {
            this.logStats(stats);

            if (err) {
              reject(err);
              return;
            }

            resolve();
          });
        });
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });

    const watchTaskName = `${taskName}:watch`;
    this.taskService.addTask(watchTaskName, [], async () => {
      this.loggerService.debug('running task', watchTaskName);

      try {
        const defaults = getDefaults(this.configService.getGlobalConfiguration());
        const config = this.configService.mergeParameters<WebpackConfig>(defaults, parameters, taskName);

        if (config.clean) {
          await Promise.all([].concat(config).map(itemConfig => this.fsService.remove(itemConfig.output.path)));
        }

        await new Promise(() => { //tslint:disable-line
          webpack([].concat(config).map(itemConfig => omit(itemConfig, 'clean'))).watch({poll: 200}, (err, stats) => {
            this.logStats(stats);

            if (err) {
              this.loggerService.error(err);
              return;
            }
          });
        });
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }

  private logStats(stats?: webpack.Stats) {
    if (stats) {
      const statsJson = stats.toJson();
      const errors = statsJson.errors.concat(statsJson.warnings);
      if (errors.length) {
        this.loggerService.error('Failed compiling', errors.join(''));
      } else {
        this.loggerService.info('Successful compiling');
      }
    }
  }
}
