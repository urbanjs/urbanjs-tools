import {inject, injectable} from 'inversify';
import * as eslint from 'gulp-eslint';
import * as gulp from 'gulp';
import {extname, dirname} from 'path';
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
} from '@tamasmagedli/urbanjs-tools-core';
import {defaults} from './defaults';
import {EslintConfig} from './types';

@injectable()
export class Eslint implements ITool<EslintConfig> {
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
  public register(taskName: string, parameters: EslintConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const extendedDefaults = {
          ...defaults,
          files: this.configService.getGlobalConfiguration().sourceFiles
        };

        const config = this.configService.mergeParameters<EslintConfig>(extendedDefaults, parameters, taskName);

        await new Promise((resolve, reject) => {
          this.validate(config)
            .on('data', () => null)
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        });
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });

    this.taskService.addTask(`${taskName}:fix`, [], async () => {
      this.loggerService.debug('running task', `${taskName}:fix`);

      try {
        const extendedDefaults = {
          ...defaults,
          files: this.configService.getGlobalConfiguration().sourceFiles
        };

        const config = this.configService.mergeParameters<EslintConfig>(extendedDefaults, parameters, taskName);

        await new Promise((resolve, reject) => {
          const filesByFolderPath = {};

          gulp.src(config.files)
            .on('error', err => reject(err))
            .on('data', (file: { path: string }) => {
              const folderPath = dirname(file.path);
              filesByFolderPath[folderPath] = filesByFolderPath[folderPath] || [];
              filesByFolderPath[folderPath].push(file.path);
            })
            .on('end', () => {
              try {
                Promise.all(
                  Object.keys(filesByFolderPath).map(folderPath => new Promise((resolveItem, rejectItem) => {
                    const itemConfig = {
                      ...config,
                      files: filesByFolderPath[folderPath],
                      fix: true
                    };

                    this.validate(itemConfig)
                      .pipe(this.streamService.streamIf(
                        (file: { eslint?: { fixed?: boolean } }) => file.eslint && file.eslint.fixed,
                        gulp.dest(folderPath),
                        {ignoreError: false}
                      ))
                      .on('error', err => rejectItem(err))
                      .on('end', () => resolveItem())
                      .on('data', () => null);
                  }))
                );
                resolve();
              } catch (e) {
                reject(e);
              }
            })
            .on('data', () => null)
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        });
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }

  private validate(config: EslintConfig & { fix?: boolean }): NodeJS.ReadWriteStream {
    const stream = gulp.src(config.files)
      .pipe(this.streamService.streamIf(
        (file: { path: string }) => config.extensions.indexOf(extname(file.path)) !== -1,
        eslint({
          ...config,
          files: undefined
        }),
        {ignoreError: false}
      ))
      .pipe(eslint.format());

    return config.fix ? stream : stream.pipe(eslint.failAfterError());
  }
}
