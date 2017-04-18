import {
  inject,
  injectable,
  Container,
  ContainerModule
} from 'inversify';
import {
  IGulp,
  ILoggerService,
  ITraceService,
  ITool,
  TYPE_DRIVER_GULP,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_TRACE,
  TYPE_TOOL,
  ToolConfiguration,
  track
} from '@tamasmagedli/urbanjs-tools-core';
import {
  NotFoundTool
} from './errors';
import {
  IToolService,
  TYPE_CONFIG_TOOL_PREFIX,
  TYPE_BASE_TOOL_CONTAINER,
  IRegistrableGulpTool
} from './types';
import {
  UrbanjsToolsError
} from './errors';

@injectable()
export class ToolService implements IToolService {
  private loggerService: ILoggerService;
  private toolPrefix: string;
  private baseToolContainer: Container;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_CONFIG_TOOL_PREFIX) toolPrefix: string,
              @inject(TYPE_BASE_TOOL_CONTAINER) baseToolContainer: Container) {
    this.toolPrefix = toolPrefix;
    this.loggerService = loggerService;
    this.baseToolContainer = baseToolContainer;
    traceService.track(this);
  }

  @track()
  public getTool(toolName: string): IRegistrableGulpTool {
    return {
      register: <T>(gulp: IGulp, taskName: string, parameters: ToolConfiguration<T>) => {
        try {
          const containerModule = this.getToolContainerModule(toolName);

          const container = new Container();
          container.parent = this.baseToolContainer;
          container.bind(TYPE_DRIVER_GULP).toConstantValue(gulp);

          container.load(containerModule);
          container.get<ITool<T>>(TYPE_TOOL).register(taskName, parameters);
        } catch (e) {
          if (!(e instanceof UrbanjsToolsError)) {
            this.loggerService.error('Unexpected error\n', e);
          }

          throw e;
        }
      }
    };
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
