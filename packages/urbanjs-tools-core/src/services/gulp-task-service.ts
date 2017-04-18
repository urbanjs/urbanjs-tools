import {inject, injectable} from 'inversify';
import {track} from '../decorators';
import {
  ILoggerService,
  ITaskService,
  TaskDependencies,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_TRACE,
  ITraceService
} from '../types';

export const TYPE_DRIVER_GULP = Symbol('TYPE_DRIVER_GULP');
export const TYPE_DRIVER_GULP_SEQUENCE = Symbol('TYPE_DRIVER_GULP_SEQUENCE');

export interface IGulp {
  tasks: Object;
  task(taskName: string, dependenciesOrCb: string[] | Function, cb?: Function);
  start(taskName: string, cb: (err: Error) => void);
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
              @inject(TYPE_DRIVER_GULP_SEQUENCE) gulpSequence: IGulpSequence,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.gulp = gulp;
    this.gulpSequence = gulpSequence.use(this.gulp);
    this.loggerService = loggerService;
    traceService.track(this);
  }

  @track()
  public addTask(taskName: string, dependencies: TaskDependencies, handler: Function) {
    if (dependencies.length) {
      this.gulp.task(
        taskName,
        this.gulpSequence.apply(null, [...dependencies, async () => await handler()])
      );
    } else {
      this.gulp.task(
        taskName,
        [],
        async () => await handler()
      );
    }
  }

  @track()
  public async runTask(taskName: string) {
    await new Promise((resolve, reject) =>
      this.gulp.start(taskName, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      })
    );
  }
}
