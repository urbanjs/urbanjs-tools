import {inject, injectable} from 'inversify';
import * as conventionalChangelog from 'gulp-conventional-changelog';
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
import {defaults} from './defaults';
import {ConventionalChangelogConfig} from './types';

@injectable()
export class ConventionalChangelog implements ITool<ConventionalChangelogConfig> {
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
  public register(taskName: string, parameters: ConventionalChangelogConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const config = this.configService.mergeParameters<ConventionalChangelogConfig>(defaults, parameters, taskName);
        await new Promise((resolve, reject) => {
          gulp.src(config.changelogFile)
            .pipe(conventionalChangelog(
              config.conventionalChangelog,
              config.context,
              config.gitRawCommits,
              config.conventionalCommitsParser,
              config.conventionalChangelogWriter
            ))
            .pipe(gulp.dest(config.outputPath))
            .on('data', () => true)
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
        });
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }
}
