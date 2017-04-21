import {Container, ContainerModule, interfaces} from 'inversify';
import * as expect from 'assert';
import {spy} from 'sinon';
import {TYPE_DRIVER_GULP, TYPE_TOOL} from '@tamasmagedli/urbanjs-tools-core';
import {ToolService} from './tool-service';
import {NotFoundTool} from './errors';
import {IRegistrableGulpTool} from './types';

describe('tool service', () => {
  let gulpMock;
  let toolServiceMock;
  let loggerServiceMock;
  let traceServiceMock;
  let requireDriverMock;
  let toolContainerMock;
  let toolPrefix;
  let toolService;

  beforeEach(() => {
    gulpMock = {
      tasks: {},
      task: spy(),
      start: spy()
    };

    toolServiceMock = {
      getTool: spy()
    };

    loggerServiceMock = {
      error: spy(),
      warn: spy(),
      debug: spy(),
      info: spy()
    };

    traceServiceMock = {
      track: spy()
    };

    requireDriverMock = {
      require: spy()
    };

    toolPrefix = 'tool-prefix';
    toolService = new ToolService(loggerServiceMock, traceServiceMock, toolPrefix, requireDriverMock, () => toolContainerMock);
  });

  describe('.getToolContainerModule()', () => {
    context('when module of the tool can be found extended with the tool prefix', () => {
      const toolModule = {containerModule: {}};
      const toolName = 'toolName';

      beforeEach(() => {
        requireDriverMock.require = spy((name: string) => {
          if (name === `${toolPrefix}${toolName}`) {
            return toolModule;
          }
          throw new Error('not found');
        });
      });

      it('returns `containerModule` from module', () => {
        const containerModule = toolService.getToolContainerModule(toolName);
        expect.equal(requireDriverMock.require.calledWith(`${toolPrefix}${toolName}`), true);
        expect.equal(containerModule, toolModule.containerModule);
      });
    });

    context('when module of the tool can be found without the tool prefix', () => {
      const toolModule = {containerModule: {}};
      const toolName = 'toolName';

      beforeEach(() => {
        requireDriverMock.require = spy((name: string) => {
          if (name === toolName) {
            return toolModule;
          }
          throw new Error('not found');
        });
      });

      it('returns `containerModule` from module', () => {
        const containerModule = toolService.getToolContainerModule(toolName);
        expect.equal(requireDriverMock.require.calledWith(`${toolPrefix}${toolName}`), true);
        expect.equal(requireDriverMock.require.calledWith(toolName), true);
        expect.equal(containerModule, toolModule.containerModule);
      });
    });

    context('when module of the tool cannot be found either with or without the tool prefix', () => {
      beforeEach(() => {
        requireDriverMock.require = spy(() => {
          throw new Error('not found');
        });
      });

      it('returns `containerModule` from module', () => {
        expect.throws(
          () => {
            toolService.getToolContainerModule('toolName');
          },
          err => err instanceof NotFoundTool
        );
      });
    });
  });

  describe('.getTool()', () => {
    it('calls getToolContainerModule synchronously', () => {
      const toolName = 'toolName';
      toolService.getToolContainerModule = spy();
      toolService.getTool(toolName);
      expect.equal(toolService.getToolContainerModule.calledWith(toolName), true);
    });

    it('returns object with .register api', () => {
      const toolName = 'toolName';
      toolService.getToolContainerModule = spy();
      const result = toolService.getTool(toolName);
      expect.equal(typeof result.register, 'function');
    });

    context('when returned .register api is called', () => {
      let tool;
      let registrableTool: IRegistrableGulpTool;

      beforeEach(() => {
        tool = {register: spy()};
        toolContainerMock = new Container();
        toolService.getToolContainerModule = spy(() =>
          new ContainerModule((bind: interfaces.Bind) => {
            bind(TYPE_TOOL).toConstantValue(tool);
          })
        );
      });

      it('registers a task with the given name and parameters', () => {
        registrableTool = toolService.getTool('toolName');

        const taskName = 'taskName';
        const taskConfig = {};
        registrableTool.register(gulpMock, taskName, taskConfig);

        expect.equal(tool.register.calledWith(taskName, taskConfig), true);
      });

      it('gulp instance is registered to the tool container', () => {
        registrableTool = toolService.getTool('toolName');

        const taskName = 'taskName';
        const taskConfig = {};
        registrableTool.register(gulpMock, taskName, taskConfig);

        expect.equal(toolContainerMock.get(TYPE_DRIVER_GULP), gulpMock);
      });
    });
  });
});
