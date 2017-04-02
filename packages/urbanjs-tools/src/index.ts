import 'reflect-metadata';
import {
  IGulp,
  TYPE_DRIVER_GULP,
  ILoggerService,
  IToolParameters,
  IConfigService,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_CONFIG,
  GlobalConfiguration
} from '@tamasmagedli/urbanjs-tools-core';
import {container} from './container';
import {
  IToolService,
  TYPE_TOOL_SERVICE
} from './types';
import {UrbanjsToolsError} from './errors';

const loggerService = container.get<ILoggerService>(TYPE_SERVICE_LOGGER);
const toolService = container.get<IToolService>(TYPE_TOOL_SERVICE);
const configService = container.get<IConfigService>(TYPE_SERVICE_CONFIG);

export {container};

export interface IRegistrableGulpTool {
  register(gulp: IGulp, taskName: string, parameters: IToolParameters): void;
}

export const tools: { [key: string]: IRegistrableGulpTool } = new Proxy({}, {
  get: (target: Object, toolName: string) => ({
    register: (gulp: IGulp, taskName: string, parameters: IToolParameters) => {
      container.snapshot();

      try {
        container.bind(TYPE_DRIVER_GULP).toConstantValue(gulp);
        toolService.initializeTool(container, toolName, taskName, parameters);
      } catch (e) {
        if (!(e instanceof UrbanjsToolsError)) {
          loggerService.error('Unexpected error\n', e);
        }

        throw e;
      } finally {
        container.restore();
      }
    }
  })
});

export const tasks = tools;

export const initializeTools = (gulp: IGulp, parametersByToolName: Object) => {
  Object.keys(parametersByToolName).forEach(toolName => {
    tools[toolName].register(gulp, toolName, parametersByToolName[toolName]);
  });
};

export const initializeTasks = (gulp: IGulp, parametersByToolNames: Object) => {
  loggerService.warn('.initializeTasks() api is deprecated. Please use .initializeTools() instead.');
  return initializeTools(gulp, parametersByToolNames);
};

export const setupInMemoryTranspile = () => {
  throw new Error('Not implemented yet');
};

export const getGlobalConfiguration = (): GlobalConfiguration => configService.getGlobalConfiguration();
export const setGlobalConfiguration = (configuration) => configService.setGlobalConfiguration(configuration);
