import {inject, injectable} from 'inversify';
import {
  ILoggerService,
  ITaskService,
  TaskDependencies,
  TYPE_SERVICE_LOGGER
} from '../types';

export const TYPE_DRIVER_GULP = Symbol('TYPE_DRIVER_GULP');
export const TYPE_DRIVER_GULP_SEQUENCE = Symbol('TYPE_DRIVER_GULP_SEQUENCE');

export interface IGulp {
  task(taskName: string, dependencies: string[], handler?: Function);
}

export interface IGulpSequence {
  use(gulp: IGulp): Function;
}

@injectable()
export class GulpTaskService implements ITaskService {
  private loggerService: ILoggerService;
  private gulp: IGulp;
  private gulpSequence: Function;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_DRIVER_GULP) gulp: IGulp,
              @inject(TYPE_DRIVER_GULP_SEQUENCE) gulpSequence: IGulpSequence) {
    this.loggerService = loggerService;
    this.gulp = gulp;
    this.gulpSequence = gulpSequence.use(this.gulp);
  }

  public addTask(taskName: string, dependencies: TaskDependencies, handler: Function) {
    this.loggerService.debug('GulpTaskService.addTask -', 'adding task', taskName);
    this.gulp.task(
      taskName,
      dependencies.length ? this.gulpSequence.apply(null, dependencies) : [],
      handler
    );
  }
}
