import {ContainerModule, interfaces} from 'inversify';
import {TYPE_TOOL} from 'urbanjs-tools-core';
import {ConventionalChangelog} from './tool';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TYPE_TOOL).to(ConventionalChangelog).inSingletonScope();
});
