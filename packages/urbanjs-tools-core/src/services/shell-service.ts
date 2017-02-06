import {inject, injectable} from 'inversify';
import {
  ILoggerService,
  IShellService,
  TYPE_SERVICE_LOGGER
} from '../types';

@injectable()
export class ShellService implements IShellService {
  private loggerService: ILoggerService;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService) {
    this.loggerService = loggerService;
  }

  public async execute(command: string) {
    this.loggerService.debug('ShellService.execute', command);
  }
}
