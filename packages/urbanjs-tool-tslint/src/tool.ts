import {inject, injectable} from 'inversify';
import tslint, {PluginOptions} from 'gulp-tslint';
import * as gulp from 'gulp';
import {extname} from 'path';
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
  IStreamService,
  TYPE_SERVICE_STREAM
} from 'urbanjs-tools-core';
import {getDefaults} from './defaults';
import {TslintConfig} from './types';

@injectable()
export class Tslint implements ITool<TslintConfig> {
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;
  private streamService: IStreamService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_SERVICE_STREAM) streamService: IStreamService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.taskService = taskService;
    this.streamService = streamService;
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: TslintConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const defaults = getDefaults(this.configService.getGlobalConfiguration());
        const config = this.configService.mergeParameters<TslintConfig>(defaults, parameters, taskName);
        await this.validate(config);
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }

  private async validate(config: TslintConfig): Promise<void> {
    const tslintConfig: PluginOptions = {
      configuration: config.configFile,
      ...config,
      configFile: undefined,
      extensions: undefined,
      files: undefined
    };

    const isTsFile = (file: { path: string }) => config.extensions.indexOf(extname(file.path)) !== -1;

    await new Promise((resolve, reject) => {
      gulp.src(config.files)
        .pipe(this.streamService.streamIf(
          isTsFile,
          tslint(tslintConfig) as NodeJS.ReadWriteStream,
          {ignoreError: false}
        ))
        .pipe(this.streamService.streamIf(
          isTsFile,
          tslint.report({summarizeFailureOutput: true}) as NodeJS.ReadWriteStream,
          {ignoreError: false}
        ))
        .on('data', () => true)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
  }
}
