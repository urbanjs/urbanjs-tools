import 'reflect-metadata';
import {Container} from 'inversify';
import * as babelCore from 'babel-core';
import * as gulpTypescript from 'gulp-typescript';
import * as typescript from 'typescript';
import * as sourceMapSupport from 'source-map-support';
import * as yargs from 'yargs';
import {
  containerModule as core,
  ITranspileService,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_BABEL_CORE,
  TYPE_DRIVER_GULP_TYPESCRIPT,
  TYPE_DRIVER_TYPESCRIPT,
  TYPE_DRIVER_SOURCE_MAP_SUPPORT,
  TYPE_SERVICE_TRANSPILE
} from 'urbanjs-tools-core';

export const container = new Container();
container.load(core);

container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
container.bind(TYPE_DRIVER_BABEL_CORE).toConstantValue(babelCore);
container.bind(TYPE_DRIVER_GULP_TYPESCRIPT).toConstantValue(gulpTypescript);
container.bind(TYPE_DRIVER_TYPESCRIPT).toConstantValue(typescript);
container.bind(TYPE_DRIVER_SOURCE_MAP_SUPPORT).toConstantValue(sourceMapSupport);

const transpileService = container.get<ITranspileService>(TYPE_SERVICE_TRANSPILE);

export const handlers = {
  beforeParse(event) {
    const src = transpileService.transpile(event.source, event.filename);
    event.source = src;
    return src;
  }
};
