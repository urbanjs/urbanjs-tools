import {inject, injectable, Container, ContainerModule} from 'inversify';
import {
  ILoggerService,
  TYPE_SERVICE_LOGGER,
  IToolParameters,
  ITool,
  TYPE_TOOL,
  ITraceService,
  TYPE_SERVICE_TRACE,
  track
} from '@tamasmagedli/urbanjs-tools-core';
import {NotFoundTool} from './errors';
import {
  IToolService,
  TYPE_CONFIG_TOOL_PREFIX
} from './types';

@injectable()
export class ToolService implements IToolService {
  private loggerService: ILoggerService;
  private toolPrefix: string;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_CONFIG_TOOL_PREFIX) toolPrefix: string) {
    this.toolPrefix = toolPrefix;
    this.loggerService = loggerService;
    traceService.track(this);
  }

  @track()
  public initializeTool<T extends IToolParameters>(container: Container,
                                                   toolName: string,
                                                   taskName: string,
                                                   parameters: T) {
    const containerModule = this.getToolContainerModule(toolName);

    container.load(containerModule);
    container.get<ITool<T>>(TYPE_TOOL).register(taskName, parameters);
    container.unload(containerModule);
  }

  private getToolContainerModule(name: string): ContainerModule {
    const packageName = `${this.toolPrefix}${name}`;

    try {
      this.loggerService.debug('ToolService.getToolContainerModule', `loading ${packageName}`);
      return require(packageName).containerModule; //tslint:disable-line
    } catch (e) {
      this.loggerService.debug('ToolService.getToolContainerModule', 'tool not found', name, e);
    }

    try {
      this.loggerService.debug('ToolService.getToolContainerModule', `loading ${name}`);
      return require(name).containerModule; //tslint:disable-line
    } catch (e) {
      this.loggerService.error(`Tool was not found: ${name}. Please install ${packageName}.`, e);
      throw new NotFoundTool();
    }
  }
}
