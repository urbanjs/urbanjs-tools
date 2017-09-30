import { Container } from 'inversify';
import * as yargs from 'yargs/yargs';
import * as chalk from 'chalk';
import * as gulpSequence from 'gulp-sequence';
import {
  containerModule as core,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_GULP_SEQUENCE,
  TYPE_DRIVER_CHALK
} from 'urbanjs-tools-core';
import {
  TYPE_TOOL_SERVICE,
  TYPE_CONFIG_TOOL_PREFIX,
  TYPE_API,
  TYPE_DRIVER_REQUIRE,
  TYPE_FACTORY_TOOL_CONTAINER
} from './types';
import { ToolService } from './tool-service';
import { Api } from './api';

function createBaseContainer() {
  const baseContainer = new Container();
  baseContainer.load(core);

  baseContainer.bind(TYPE_FACTORY_TOOL_CONTAINER).toFactory(() => createBaseContainer);

  baseContainer.bind(TYPE_DRIVER_REQUIRE).toConstantValue({require});
  baseContainer.bind(TYPE_DRIVER_CHALK).toConstantValue(chalk);
  baseContainer.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
  baseContainer.bind(TYPE_DRIVER_GULP_SEQUENCE).toConstantValue(gulpSequence);
  baseContainer.bind(TYPE_CONFIG_TOOL_PREFIX).toConstantValue('urbanjs-tool-');
  baseContainer.bind(TYPE_TOOL_SERVICE).to(ToolService).inSingletonScope();
  baseContainer.bind(TYPE_API).to(Api).inSingletonScope();

  return baseContainer;
}

export const container = createBaseContainer();
