import {ContainerModule, interfaces} from 'inversify';
import * as duplexify from 'duplexify';
import * as forkStream from 'fork-stream';
import * as through2 from 'through2';
import * as mergeStream from 'merge-stream';
import {
  TYPE_TOOL,
  TYPE_DRIVER_THROUGH2,
  TYPE_DRIVER_DUPLEXIFY,
  TYPE_DRIVER_FORK_STREAM,
  TYPE_DRIVER_MERGE_STREAM
} from '@tamasmagedli/urbanjs-tools-core';
import {Eslint} from './tool';

export default new ContainerModule((bind: interfaces.Bind) => { //tslint:disable-line
  bind(TYPE_DRIVER_THROUGH2).toConstantValue(through2);
  bind(TYPE_DRIVER_DUPLEXIFY).toConstantValue(duplexify);
  bind(TYPE_DRIVER_MERGE_STREAM).toConstantValue(mergeStream);
  bind(TYPE_DRIVER_FORK_STREAM).toConstantValue(forkStream);
  bind(TYPE_TOOL).to(Eslint).inSingletonScope();
});
