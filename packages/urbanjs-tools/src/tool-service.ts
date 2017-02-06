import {inject, injectable, Container} from 'inversify';
import {
  ILoggerService,
  TYPE_SERVICE_LOGGER,
  IToolParameters,
  ITool
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
              @inject(TYPE_CONFIG_TOOL_PREFIX) toolPrefix: string) {
    this.toolPrefix = toolPrefix;
    this.loggerService = loggerService;
  }

  public initializeTool<T extends IToolParameters>(container: Container,
                                                   toolName: string,
                                                   taskName: string,
                                                   parameters: T) {
    const Tool = this.loadTool(toolName).Tool;
    const type = Symbol(toolName);

    container.bind(type).to(Tool);

    const tool = container.get<ITool<T>>(type);
    tool.register(taskName, parameters);
  }

  private loadTool(name: string) {
    this.loggerService.debug('ToolService.loadTool', `loading ${name}`);
    const packageName = `${this.toolPrefix}${name}`;

    try {
      return require(packageName); //tslint:disable-line
    } catch (e) {
      this.loggerService.error(`Tool was not found: ${name}. Please install ${packageName}.`);
      throw new NotFoundTool();
    }
  }
}
