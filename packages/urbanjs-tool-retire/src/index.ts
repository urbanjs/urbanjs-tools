import {ContainerModule, interfaces} from 'inversify';
import {TYPE_TOOL} from '@tamasmagedli/urbanjs-tools-core';
import {Retire} from './tool';

export default new ContainerModule((bind: interfaces.Bind) => { //tslint:disable-line
  bind(TYPE_TOOL).to(Retire).inSingletonScope();
});
