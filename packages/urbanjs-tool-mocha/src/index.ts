import {ContainerModule, interfaces} from 'inversify';
import * as del from 'del';
import {
  TYPE_TOOL,
  TYPE_DRIVER_DEL
} from '@tamasmagedli/urbanjs-tools-core';
import {Mocha} from './tool';

export default new ContainerModule((bind: interfaces.Bind) => { //tslint:disable-line
  bind(TYPE_DRIVER_DEL).toConstantValue(del);
  bind(TYPE_TOOL).to(Mocha).inSingletonScope();
});
