import {Container} from 'inversify';
import * as yargs from 'yargs/yargs';
import * as chalk from 'chalk';
import * as gulpSequence from 'gulp-sequence';
import {
  container as coreContainer,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_GULP_SEQUENCE,
  TYPE_DRIVER_CHALK
} from '@tamasmagedli/urbanjs-tools-core';
import {
  TYPE_TOOL_SERVICE,
  TYPE_CONFIG_TOOL_PREFIX
} from './types';
import {
  ToolService
} from './tool-service';

export const container = new Container();
container.parent = coreContainer;

container.bind(TYPE_DRIVER_CHALK).toConstantValue(chalk);
container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
container.bind(TYPE_DRIVER_GULP_SEQUENCE).toConstantValue(gulpSequence);
container.bind(TYPE_CONFIG_TOOL_PREFIX).toConstantValue('@tamasmagedli/urbanjs-tool-');
container.bind(TYPE_TOOL_SERVICE).to(ToolService).inSingletonScope();
