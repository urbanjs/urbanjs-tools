import {inject, injectable, Container} from 'inversify';
import {
  ILoggerService,
  TYPE_SERVICE_LOGGER,
  IToolParameters,
  ITool,
  Constructor
} from '@tamasmagedli/urbanjs-tools-core';
import {NotFoundTool} from './errors';
import {
  IToolService,
  TYPE_CONFIG_TOOL_PREFIX
} from './types';
import {
  ITraceService,
  TYPE_SERVICE_TRACE,
  track
} from '@tamasmagedli/urbanjs-tools-core';

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
    const type = Symbol(toolName);
    container.bind(type).to(this.getTool<T>(toolName));
    container.get<ITool<T>>(type).register(taskName, parameters);
  }

  private getTool<T extends IToolParameters>(name: string): Constructor<ITool<T>> {
    const packageName = `${this.toolPrefix}${name}`;

    try {
      this.loggerService.debug('ToolService.getTool', `loading ${packageName}`);
      return this.getToolConstructorFromModule(require(packageName)); //tslint:disable-line
    } catch (e) {
      this.loggerService.debug('ToolService.getTool', 'tool not found', name, e);
    }

    try {
      this.loggerService.debug('ToolService.getTool', `loading ${name}`);
      return this.getToolConstructorFromModule(require(name)); //tslint:disable-line
    } catch (e) {
      this.loggerService.error(`Tool was not found: ${name}. Please install ${packageName}.`, e);
      throw new NotFoundTool();
    }
  }

  private getToolConstructorFromModule<T extends IToolParameters>(module?: { Tool?: Constructor<ITool<T>> }): Constructor<ITool<T>> {
    // TODO
    // add a more robust solution to find the constructor of a package
    return module && module.Tool;
  }
}
