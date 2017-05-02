import {Container} from 'inversify';
import {
  IGulp,
  ToolParameters,
  ToolConfiguration,
  GlobalConfiguration
} from 'urbanjs-tools-core';
import * as webpack from 'webpack';

export const TYPE_TOOL_SERVICE = Symbol('TYPE_TOOL_SERVICE');
export const TYPE_CONFIG_TOOL_PREFIX = Symbol('TYPE_CONFIG_TOOL_PREFIX');
export const TYPE_DRIVER_REQUIRE = Symbol('TYPE_DRIVER_REQUIRE');
export const TYPE_FACTORY_TOOL_CONTAINER = Symbol('TYPE_FACTORY_TOOL_CONTAINER');
export const TYPE_API = Symbol('TYPE_API');

export interface IRequireDriver {
  require<T>(name: string): T;
}

export type ToolContainerFactory = () => Container;

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
  initializePresets(gulp: IGulp, configsByPresetName: { [key: string]: PresetConfig }): void;
  initializeTask<T>(gulp: IGulp, toolName: string, parameters: ToolConfiguration<T>): void;
  initializeTasks(gulp: IGulp, parametersByToolName: { [key: string]: ToolConfiguration<any> }): void;
  getTool(toolName): IRegistrableGulpTool;
  setGlobalConfiguration(configuration: ToolConfiguration<GlobalConfiguration>);
  getGlobalConfiguration(): GlobalConfiguration;
  setupInMemoryTranspile(): void;
}
