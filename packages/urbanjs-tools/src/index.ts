import 'reflect-metadata';
import {IConfigService, TYPE_SERVICE_CONFIG} from '@tamasmagedli/urbanjs-tools-core';
import {container} from './container';
import {globals} from './globals';
import {IApi, TYPE_API} from './types';

const configService = container.get<IConfigService>(TYPE_SERVICE_CONFIG);
configService.setGlobalConfiguration(globals);

const api = container.get<IApi>(TYPE_API);
export default api;

module.exports = api;
module.exports.default = api;
