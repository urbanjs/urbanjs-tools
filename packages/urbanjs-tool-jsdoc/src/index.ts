import {ContainerModule, interfaces} from 'inversify';
import * as del from 'del';
import {TYPE_TOOL, TYPE_DRIVER_DEL} from 'urbanjs-tools-core';
import {JSDoc} from './tool';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TYPE_DRIVER_DEL).toConstantValue(del);
  bind(TYPE_TOOL).to(JSDoc).inSingletonScope();
});
