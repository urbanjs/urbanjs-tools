import {injectable, inject} from 'inversify';
import {mapValues, camelCase} from 'lodash';
import {
  GlobalConfiguration,
  IConfigService,
  IGulp,
  ILoggerService,
  ITraceService,
  ToolConfiguration,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_TRACE,
  track,
  IGulpSequence,
  TYPE_DRIVER_GULP_SEQUENCE
} from 'urbanjs-tools-core';
import {
  IToolService,
  TYPE_TOOL_SERVICE,
  IApi,
  PresetConfig,
  IRegistrableGulpTool,
  TYPE_DRIVER_REQUIRE,
  IRequireDriver,
  TYPE_CONFIG_TOOL_PREFIX
} from './types';
import {InvalidUsage} from './errors';
import {presets} from './presets';
import {toolNameByTaskName} from './tasks';

@injectable()
export class Api implements IApi {
  private toolService: IToolService;
  private loggerService: ILoggerService;
  private configService: IConfigService;
  private requireDriver: IRequireDriver;
  private gulpSequence: IGulpSequence;
  private toolPrefix: string;

  public tasks: { [key: string]: IRegistrableGulpTool };

  constructor(@inject(TYPE_TOOL_SERVICE) toolService: IToolService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_DRIVER_REQUIRE) requireDriver: IRequireDriver,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_DRIVER_GULP_SEQUENCE) gulpSequence: IGulpSequence,
              @inject(TYPE_CONFIG_TOOL_PREFIX) toolPrefix: string) {
    traceService.track(this);

    this.toolService = toolService;
    this.loggerService = loggerService;
    this.configService = configService;
    this.requireDriver = requireDriver;
    this.gulpSequence = gulpSequence;
    this.toolPrefix = toolPrefix;

    this.tasks = {};
    Object.keys(toolNameByTaskName).forEach((taskName: string) => {
      Object.defineProperty(this.tasks, taskName, {
        enumerable: true,
        get() {
          loggerService.warn('.tasks property will be removed in the next major version. Please use .initializeTasks or .initializePresets methods instead.');
          return toolService.getTool(toolNameByTaskName[taskName]);
        }
      });
    });
  }

  @track()
  public setupInMemoryTranspile() {
    const mochaToolPackageName = `${this.toolPrefix}-mocha`;
    try {
      this.requireDriver.require(`${mochaToolPackageName}/dist/setup-file`);
    } catch (e) {
      this.loggerService.error(`Please install ${mochaToolPackageName} to use .setupInMemoryTranspile api`);
      throw e;
    }
  }

  @track()
  public getGlobalConfiguration() {
    return this.configService.getGlobalConfiguration();
  }

  @track()
  public setGlobalConfiguration(configuration: ToolConfiguration<GlobalConfiguration>) {
    return this.configService.setGlobalConfiguration(configuration);
  }

  @track()
  public getTool(toolName): IRegistrableGulpTool {
    return this.toolService.getTool(toolName);
  }

  @track()
  public initializeTask<T>(gulp: IGulp, toolName: string, parameters: ToolConfiguration<T>) {
    this.toolService.getTool(toolName).register(gulp, toolName, parameters);
  }

  @track()
  public initializeTasks(gulp: IGulp, parametersByToolName: { [key: string]: ToolConfiguration<any> }) {
    Object.keys(parametersByToolName).forEach(toolName => {
      this.initializeTask(gulp, toolName, parametersByToolName[toolName]);
    });
  }

  @track()
  public initializePreset(gulp: IGulp, presetName: string, config: PresetConfig) {
    let defaults;
    if (presets.hasOwnProperty(presetName)) {
      defaults = presets[presetName].filter((item: string) => {
        if (presets.hasOwnProperty(item)) {
          return true;
        }

        return gulp.tasks.hasOwnProperty(item);
      });
    }

    let taskNames;
    if (config === true && defaults) {
      taskNames = defaults;
    } else if (typeof config === 'function') {
      taskNames = config(defaults);
    } else if (Array.isArray(config)) {
      taskNames = config;
    } else {
      this.loggerService.error('Invalid preset configuration', config);
      throw new InvalidUsage();
    }

    const currentSequence = this.gulpSequence.use(gulp);
    gulp.task(
      presetName,
      taskNames && taskNames.length ? currentSequence.apply(null, taskNames) : []
    );
  }

  @track()
  public initializePresets(gulp: IGulp, configsByPresetName: { [key: string]: PresetConfig }) {
    Object.keys(configsByPresetName).forEach(presetName => {
      this.initializePreset(gulp, presetName, configsByPresetName[presetName]);
    });
  }

  @track()
  public initialize(gulp: IGulp, config: { [key: string]: PresetConfig | ToolConfiguration<any> }) {
    this.loggerService.warn('.initialize method will be removed in the next major version. Please use .initializeTasks or .initializePresets methods instead.');

    const presetConfigsByPresetName = Object.keys(presets).reduce((acc, presetName) => ({
      ...acc,
      [presetName]: true
    }), {});

    Object.keys(config).forEach((taskOrPresetName: string) => {
      const parameters = config[taskOrPresetName];
      const isTool = toolNameByTaskName.hasOwnProperty(taskOrPresetName);

      if (parameters === false) {
        delete presetConfigsByPresetName[taskOrPresetName];
      } else if (isTool) {
        const toolName = toolNameByTaskName[taskOrPresetName];
        this.toolService.getTool(toolName).register(gulp, toolName, parameters);
      } else {
        presetConfigsByPresetName[taskOrPresetName] = parameters;
      }
    });

    Object.keys(presetConfigsByPresetName).forEach((presetName: string) => {
      this.initializePreset(gulp, presetName, <PresetConfig>presetConfigsByPresetName[presetName]);
    });
  }
}
