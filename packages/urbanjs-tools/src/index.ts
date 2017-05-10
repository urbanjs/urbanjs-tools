import 'reflect-metadata';
import {IConfigService, TYPE_SERVICE_CONFIG} from 'urbanjs-tools-core';
import {container} from './container';
import {globals} from './globals';
import {IApi, TYPE_API} from './types';

const configService = container.get<IConfigService>(TYPE_SERVICE_CONFIG);
configService.setGlobalConfiguration(globals);

const api = container.get<IApi>(TYPE_API);

[
  'setupInMemoryTranspile',
  'getGlobalConfiguration',
  'setGlobalConfiguration',
  'getTool',
  'initializeTask',
  'initializeTasks',
  'initializePreset',
  'initializePresets',
  'initialize'
].forEach(methodName => {
  if (typeof api[methodName] === 'function') {
    api[methodName] = api[methodName].bind(api);
  }
});

export default api;

module.exports = api;
module.exports.default = api;
