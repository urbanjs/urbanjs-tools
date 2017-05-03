import {Container} from 'inversify';
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
import {ToolService} from './tool-service';
import {Api} from './api';

function createBaseContainer() {
  const container = new Container();
  container.load(core);

  container.bind(TYPE_FACTORY_TOOL_CONTAINER).toFactory(() => createBaseContainer);

  container.bind(TYPE_DRIVER_REQUIRE).toConstantValue({require});
  container.bind(TYPE_DRIVER_CHALK).toConstantValue(chalk);
  container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
  container.bind(TYPE_DRIVER_GULP_SEQUENCE).toConstantValue(gulpSequence);
  container.bind(TYPE_CONFIG_TOOL_PREFIX).toConstantValue('urbanjs-tool-');
  container.bind(TYPE_TOOL_SERVICE).to(ToolService).inSingletonScope();
  container.bind(TYPE_API).to(Api).inSingletonScope();

  return container;
}

export const container = createBaseContainer();
