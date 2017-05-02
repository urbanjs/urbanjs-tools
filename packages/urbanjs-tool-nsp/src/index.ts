import {ContainerModule, interfaces} from 'inversify';
import {TYPE_TOOL} from 'urbanjs-tools-core';
import {Nsp} from './tool';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TYPE_TOOL).to(Nsp).inSingletonScope();
});
