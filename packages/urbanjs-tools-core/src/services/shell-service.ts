import {inject, injectable} from 'inversify';
import {
  ILoggerService,
  IShellService,
  TYPE_SERVICE_LOGGER, ITraceService, TYPE_SERVICE_TRACE
} from '../types';
import {track} from '../decorators';

@injectable()
export class ShellService implements IShellService {
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    traceService.track(this);
  }

  @track()
  public async execute(command: string) {
    throw new Error('Not implemented yet');
  }
}
