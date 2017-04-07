import {ContainerModule, interfaces} from 'inversify';
import * as babelCore from 'babel-core';
import * as gulpTypescript from 'gulp-typescript';
import * as typescript from 'typescript';
import * as sourceMapSupport from 'source-map-support';
import {
  TYPE_TOOL,
  TYPE_DRIVER_SOURCE_MAP_SUPPORT,
  TYPE_DRIVER_GULP_TYPESCRIPT,
  TYPE_DRIVER_TYPESCRIPT,
  TYPE_DRIVER_BABEL_CORE
} from '@tamasmagedli/urbanjs-tools-core';
import {CheckDependencies} from './tool';

export default new ContainerModule((bind: interfaces.Bind) => { //tslint:disable-line
  bind(TYPE_DRIVER_BABEL_CORE).toConstantValue(babelCore);
  bind(TYPE_DRIVER_GULP_TYPESCRIPT).toConstantValue(gulpTypescript);
  bind(TYPE_DRIVER_TYPESCRIPT).toConstantValue(typescript);
  bind(TYPE_DRIVER_SOURCE_MAP_SUPPORT).toConstantValue(sourceMapSupport);
  bind(TYPE_TOOL).to(CheckDependencies).inSingletonScope();
});
