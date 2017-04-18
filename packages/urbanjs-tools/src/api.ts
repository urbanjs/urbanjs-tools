import 'reflect-metadata';
import {injectable, inject} from 'inversify';
import {mapValues, camelCase} from 'lodash';
import * as gulpSequence from 'gulp-sequence';
import {
  GlobalConfiguration,
  IConfigService,
  IGulp,
  ILoggerService,
  ToolConfiguration,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_LOGGER
} from '@tamasmagedli/urbanjs-tools-core';
import {
  IToolService,
  TYPE_TOOL_SERVICE,
  IApi,
  PresetConfig, IRegistrableGulpTool
} from './types';
import {presets} from './presets';
import {toolNameByTaskName} from './tasks';

@injectable()
export class Api implements IApi {
  private toolService: IToolService;
  private loggerService: ILoggerService;
  private configService: IConfigService;

  public tasks: { [key: string]: IRegistrableGulpTool };

  constructor(@inject(TYPE_TOOL_SERVICE) toolService: IToolService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_CONFIG) configService: IConfigService) {
    this.toolService = toolService;
    this.loggerService = loggerService;
    this.configService = configService;

    this.tasks = <{ [key: string]: IRegistrableGulpTool }>Object
      .keys(toolNameByTaskName)
      .reduce(
        (acc: Object, taskName: string) => ({
          ...acc,
          [taskName]: toolService.getTool(toolNameByTaskName[taskName])
        }),
        {}
      );
  }

  public setupInMemoryTranspile() {
    try {
      require('@tamasmagedli/urbanjs-tool-mocha/dist/setup-file');
    } catch (e) {
      this.loggerService.error('Please install @tamasmagedli/urbanjs-tool-mocha to use .setupInMemoryTranspile api');
      throw e;
    }
  }

  public getGlobalConfiguration() {
    return this.configService.getGlobalConfiguration();
  }

  public setGlobalConfiguration(configuration: ToolConfiguration<GlobalConfiguration>) {
    return this.configService.setGlobalConfiguration(configuration);
  }

  public getTool(toolName): IRegistrableGulpTool {
    return this.toolService.getTool(toolName);
  }

  public initializeTask<T>(gulp: IGulp, toolName: string, parameters: ToolConfiguration<T>) {
    this.toolService.getTool(toolName).register(gulp, toolName, parameters);
  }

  public initializeTasks(gulp: IGulp, parametersByToolName: Object) {
    Object.keys(parametersByToolName).forEach(toolName => {
      this.initializeTask(gulp, toolName, parametersByToolName[toolName]);
    });
  }

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
      throw new Error('Invalid arguments');
    }

    const currentSequence = gulpSequence.use(gulp);
    gulp.task(
      presetName,
      taskNames && taskNames.length ? currentSequence.apply(null, taskNames) : []
    );
  }

  public initializePresets(gulp: IGulp, configsByPresetName: PresetConfig) {
    Object.keys(configsByPresetName).forEach(presetName => {
      this.initializePreset(gulp, presetName, configsByPresetName[presetName]);
    });
  }

  public initialize(gulp: IGulp, config: { [key: string]: PresetConfig | ToolConfiguration<any> }) {
    this.loggerService.warn('.initialize method will be deprecated in the next major version. Please use .initializeTasks or .initializePresets methods instead.');

    Object.keys(config).forEach((taskOrPresetName: string) => {
      const parameters = config[taskOrPresetName];

      let tool: IRegistrableGulpTool;
      try {
        tool = this.toolService.getTool(taskOrPresetName);
      } catch (e) {
        // ignore error
      }

      if (tool) {
        tool.register(gulp, taskOrPresetName, parameters);
      } else {
        this.initializePreset(gulp, taskOrPresetName, <PresetConfig>parameters);
      }
    });
  }
}
