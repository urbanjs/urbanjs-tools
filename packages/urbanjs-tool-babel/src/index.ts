import {ContainerModule, interfaces} from 'inversify';
import * as del from 'del';
import * as duplexify from 'duplexify';
import * as forkStream from 'fork-stream';
import * as through2 from 'through2';
import * as mergeStream from 'merge-stream';
import {
  TYPE_TOOL,
  TYPE_DRIVER_DEL,
  TYPE_DRIVER_THROUGH2,
  TYPE_DRIVER_DUPLEXIFY,
  TYPE_DRIVER_FORK_STREAM,
  TYPE_DRIVER_MERGE_STREAM
} from 'urbanjs-tools-core';
import {Babel} from './tool';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TYPE_DRIVER_DEL).toConstantValue(del);
  bind(TYPE_DRIVER_THROUGH2).toConstantValue(through2);
  bind(TYPE_DRIVER_DUPLEXIFY).toConstantValue(duplexify);
  bind(TYPE_DRIVER_MERGE_STREAM).toConstantValue(mergeStream);
  bind(TYPE_DRIVER_FORK_STREAM).toConstantValue(forkStream);
  bind(TYPE_TOOL).to(Babel).inSingletonScope();
});
