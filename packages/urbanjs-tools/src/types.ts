import {
  IGulp,
  ToolParameters,
  ToolConfiguration, GlobalConfiguration
} from '@tamasmagedli/urbanjs-tools-core';

export const TYPE_TOOL_SERVICE = Symbol('TYPE_TOOL_SERVICE');
export const TYPE_BASE_TOOL_CONTAINER = Symbol('TYPE_BASE_TOOL_CONTAINER');
export const TYPE_CONFIG_TOOL_PREFIX = Symbol('TYPE_CONFIG_TOOL_PREFIX');
export const TYPE_API = Symbol('TYPE_API');

export interface IRegistrableGulpTool {
  register<T>(gulp: IGulp, taskName: string, parameters: ToolConfiguration<T>): void;
}

export interface IToolService {
  getTool<T extends ToolParameters>(toolName: string): IRegistrableGulpTool;
}

export type PresetConfig = (string | string[])[] | boolean | Function;

export interface IApi {
  initialize(gulp: IGulp, config: { [key: string]: PresetConfig | ToolConfiguration<any> }): void;
  initializePreset(gulp: IGulp, presetName: string, config: PresetConfig): void;
  initializePresets(gulp: IGulp, configsByPresetName: PresetConfig): void;
  initializeTask<T>(gulp: IGulp, toolName: string, parameters: ToolConfiguration<T>): void;
  initializeTasks(gulp: IGulp, parametersByToolName: Object): void;
  getTool(toolName): IRegistrableGulpTool;
  setGlobalConfiguration(configuration: ToolConfiguration<GlobalConfiguration>);
  getGlobalConfiguration(): GlobalConfiguration;
  setupInMemoryTranspile(): void;
}
