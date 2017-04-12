import {ContainerModule, interfaces} from 'inversify';
import {TYPE_TOOL} from '@tamasmagedli/urbanjs-tools-core';
import {Retire} from './tool';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TYPE_TOOL).to(Retire).inSingletonScope();
});
