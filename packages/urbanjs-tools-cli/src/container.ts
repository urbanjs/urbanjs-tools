import {Container} from 'inversify';
import * as yargs from 'yargs/yargs';
import * as del from 'del';
import * as mkdirp from 'mkdirp';
import {
  containerModule as core,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_DEL,
  TYPE_DRIVER_MKDIRP
} from 'urbanjs-tools-core';
import {
  DefaultCommand,
  GenerateCommand
} from './commands';
import {
  TYPE_CONFIG_VERSION,
  TYPE_COMMAND_DEFAULT,
  TYPE_COMMAND_GENERATE
} from './types';

const CLI_VERSION = require('../package.json').version; //tslint:disable-line

export const container = new Container();
container.load(core);

container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
container.bind(TYPE_DRIVER_DEL).toConstantValue(del);
container.bind(TYPE_DRIVER_MKDIRP).toConstantValue(mkdirp);
container.bind(TYPE_CONFIG_VERSION).toConstantValue(CLI_VERSION);
container.bind(TYPE_COMMAND_GENERATE).to(GenerateCommand).inSingletonScope();
container.bind(TYPE_COMMAND_DEFAULT).to(DefaultCommand).inSingletonScope();
