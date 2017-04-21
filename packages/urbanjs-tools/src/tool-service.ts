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
  TYPE_DRIVER_REQUIRE,
  TYPE_FACTORY_TOOL_CONTAINER,
  IRegistrableGulpTool,
  IRequireDriver, ToolContainerFactory
} from './types';
import {
  UrbanjsToolsError
} from './errors';

@injectable()
export class ToolService implements IToolService {
  private loggerService: ILoggerService;
  private toolPrefix: string;
  private requireDriver: IRequireDriver;
  private containerFactory: ToolContainerFactory;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_CONFIG_TOOL_PREFIX) toolPrefix: string,
              @inject(TYPE_DRIVER_REQUIRE) requireDriver: IRequireDriver,
              @inject(TYPE_FACTORY_TOOL_CONTAINER) containerFactory: ToolContainerFactory) {
    this.toolPrefix = toolPrefix;
    this.requireDriver = requireDriver;
    this.loggerService = loggerService;
    this.containerFactory = containerFactory;
    traceService.track(this);
  }

  @track()
  public getTool(toolName: string): IRegistrableGulpTool {
    const containerModule = this.getToolContainerModule(toolName);

    return {
      register: <T>(gulp: IGulp, taskName: string, parameters: ToolConfiguration<T>) => {
        try {
          const container = this.containerFactory();
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

  public getToolContainerModule(name: string): ContainerModule {
    const logPrefix = 'ToolService.getToolContainerModule';
    const packageName = `${this.toolPrefix}${name}`;

    try {
      this.loggerService.debug(logPrefix, `loading ${packageName}`);
      return this.requireDriver.require<{ containerModule: ContainerModule }>(packageName).containerModule;
    } catch (e) {
      this.loggerService.debug(logPrefix, 'tool not found', name, e);
    }

    try {
      this.loggerService.debug(logPrefix, `loading ${name}`);
      return this.requireDriver.require<{ containerModule: ContainerModule }>(name).containerModule;
    } catch (e) {
      this.loggerService.error(`Tool was not found: ${name}. Please install ${packageName}.`, e);
      throw new NotFoundTool();
    }
  }
}
