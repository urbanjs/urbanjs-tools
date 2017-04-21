import * as expect from 'assert';
import {spy} from 'sinon';
import {GlobalConfiguration} from '@tamasmagedli/urbanjs-tools-core';
import {Api} from './api';
import {InvalidUsage} from './errors';
import {toolNameByTaskName} from './tasks';
import {presets} from './presets';

describe('api', () => {
  let gulpMock;
  let gulpSequenceMock;
  let toolServiceMock;
  let loggerServiceMock;
  let requireDriverMock;
  let traceServiceMock;
  let configServiceMock;
  let toolPrefix;
  let api;

  beforeEach(() => {
    gulpMock = {
      tasks: {},
      task: spy(),
      start: spy()
    };

    gulpSequenceMock = {use: spy()};

    toolServiceMock = {
      getTool: spy()
    };

    loggerServiceMock = {
      error: spy(),
      warn: spy(),
      debug: spy(),
      info: spy()
    };

    configServiceMock = {
      getGlobalConfiguration: spy(),
      setGlobalConfiguration: spy()
    };

    requireDriverMock = {
      require: spy()
    };

    traceServiceMock = {
      track: spy()
    };

    toolPrefix = 'tool-prefix';

    api = new Api(
      toolServiceMock,
      loggerServiceMock,
      configServiceMock,
      requireDriverMock,
      traceServiceMock,
      gulpSequenceMock,
      toolPrefix
    );
  });

  describe(('.tasks'), () => {
    it('is an object with the existing task names as keys', () => {
      expect.equal(typeof api.tasks === 'object', true);
      expect.deepEqual(Object.keys(api.tasks), Object.keys(toolNameByTaskName));
    });

    it('tasks are registrable gulp tool getters', () => {
      Object.keys(toolNameByTaskName).forEach(taskName => {
        const tool = {register: spy()};
        toolServiceMock.getTool = spy(() => tool);

        expect.equal(typeof Object.getOwnPropertyDescriptor(api.tasks, taskName).get === 'function', true);
        expect.equal(api.tasks[taskName], tool, `task of ${taskName}`);
        expect.equal(toolServiceMock.getTool.calledOnce, true);
      });
    });

    it('tasks are not initialized by default', () => {
      toolServiceMock.getTool = spy(() => true);
      const taskName = Object.keys(toolNameByTaskName)[0];

      expect.equal(toolServiceMock.getTool.called, false);
      expect.equal(api.tasks[taskName], true);
      expect.equal(toolServiceMock.getTool.calledOnce, true);
    });
  });

  describe('.setupInMemoryTranspile()', () => {
    context('when mocha tool can be found', () => {
      it('requires setup file of mocha tool', () => {
        api.setupInMemoryTranspile();
        expect.equal(requireDriverMock.require.calledWith(`${toolPrefix}-mocha/dist/setup-file`), true);
      });
    });

    context('when mocha tool cannot be found', () => {
      let error;

      beforeEach(() => {
        error = new Error('not found');
        requireDriverMock.require = spy(() => {
          throw error;
        });
      });

      it('throws error', () => {
        expect.throws(
          () => {
            api.setupInMemoryTranspile();
          },
          err => err === error
        );

        const errorMessage = `Please install ${toolPrefix}-mocha to use .setupInMemoryTranspile api`;
        expect.equal(loggerServiceMock.error.calledWith(errorMessage), true);
      });
    });
  });

  describe('.getGlobalConfiguration()', () => {
    it('proxies configService.getGlobalConfiguration', () => {
      api.getGlobalConfiguration();
      expect.equal(configServiceMock.getGlobalConfiguration.calledWith(), true);
    });
  });

  describe('.setGlobalConfiguration()', () => {
    it('proxies configService.setGlobalConfiguration', () => {
      const config: GlobalConfiguration = {};
      api.setGlobalConfiguration(config);
      expect.equal(configServiceMock.setGlobalConfiguration.calledWith(config), true);
    });
  });

  describe('.getTool()', () => {
    it('proxies toolService.getTool', () => {
      const toolName = 'toolName';
      api.getTool(toolName);
      expect.equal(toolServiceMock.getTool.calledWith(toolName), true);
    });
  });

  describe('.initializeTask()', () => {
    it('gets tool and registers the tasks with the given parameters', () => {
      const tool = {register: spy()};
      const toolName = 'toolName';
      const parameters = {};

      toolServiceMock.getTool = spy(() => tool);
      api.initializeTask(gulpMock, toolName, parameters);

      expect.equal(toolServiceMock.getTool.calledWith(toolName), true);
      expect.equal(tool.register.calledWith(gulpMock, toolName, parameters), true);
    });
  });

  describe('.initializeTasks()', () => {
    it('iterates over the given object and uses .initializeTask', () => {
      const toolA: [string, Object] = ['toolNameA', {}];
      const toolB: [string, Object] = ['toolNameB', {}];

      api.initializeTask = spy();
      api.initializeTasks(gulpMock, {
        [toolA[0]]: toolA[1],
        [toolB[0]]: toolB[1]
      });

      expect.equal(api.initializeTask.calledWith(gulpMock, toolA[0], toolA[1]), true);
      expect.equal(api.initializeTask.calledWith(gulpMock, toolB[0], toolB[1]), true);
    });
  });

  describe('.initializePreset()', () => {
    it('throws if config is not valid', () => {
      expect.throws(() => {
        api.initializePreset(gulpMock, 'pre-release', /random/);
      }, InvalidUsage);
    });

    context('when known preset is given', () => {
      context('and config is function', () => {
        let presetConfig;
        beforeEach(() => {
          presetConfig = spy(() => []);
        });

        it('default tasks are filtered and only the existing tasks remain', () => {
          gulpMock.tasks = {babel: true};

          api.initializePreset(gulpMock, 'dist', presetConfig);
          expect.equal(presetConfig.calledWith(['babel']), true);
        });

        it('default presets remain within the preset', () => {
          api.initializePreset(gulpMock, 'pre-release', presetConfig);
          expect.equal(presetConfig.calledWith(['pre-commit', 'dist', 'doc']), true);
        });
      });

      context('and config is true (aka use defaults)', () => {
        let presetConfig;
        beforeEach(() => {
          presetConfig = true;
        });

        it('uses the default config', () => {
          const gulpSequenceResult = [];
          const gulpSequenceInstance = spy(() => gulpSequenceResult);
          gulpSequenceMock.use = spy(() => gulpSequenceInstance);

          api.initializePreset(gulpMock, 'pre-release', presetConfig);
          expect.equal(gulpMock.task.calledWith('pre-release', gulpSequenceResult), true);
          expect.equal(gulpSequenceInstance.calledWith(...presets['pre-release']), true);
        });
      });

      context('and config is array of task names', () => {
        let presetConfig;
        beforeEach(() => {
          presetConfig = ['task1', 'task2'];
        });

        it('uses the given config and ignores the defaults', () => {
          const gulpSequenceResult = [];
          const gulpSequenceInstance = spy(() => gulpSequenceResult);
          gulpSequenceMock.use = spy(() => gulpSequenceInstance);

          api.initializePreset(gulpMock, 'pre-release', presetConfig);
          expect.equal(gulpMock.task.calledWith('pre-release', gulpSequenceResult), true);
          expect.equal(gulpSequenceInstance.calledWith(...presetConfig), true);
        });
      });
    });

    context('when unknown preset is given', () => {
      context('and config is function', () => {
        let presetConfig;
        beforeEach(() => {
          presetConfig = spy(() => []);
        });

        it('default config is undefined', () => {
          api.initializePreset(gulpMock, 'unknown', presetConfig);
          expect.equal(presetConfig.calledWith(undefined), true);
        });
      });

      context('and config is true (aka use defaults)', () => {
        let presetConfig;
        beforeEach(() => {
          presetConfig = true;
        });

        it('throws', () => {
          expect.throws(() => {
            api.initializePreset(gulpMock, 'unknown', presetConfig);
          }, InvalidUsage);
        });
      });

      context('and config is array of task names', () => {
        let presetConfig;
        beforeEach(() => {
          presetConfig = ['task1', 'task2'];
        });

        it('uses the given config as is', () => {
          const gulpSequenceResult = [];
          const gulpSequenceInstance = spy(() => gulpSequenceResult);
          gulpSequenceMock.use = spy(() => gulpSequenceInstance);

          api.initializePreset(gulpMock, 'unknown', presetConfig);
          expect.equal(gulpMock.task.calledWith('unknown', gulpSequenceResult), true);
          expect.equal(gulpSequenceInstance.calledWith(...presetConfig), true);
        });
      });
    });
  });

  describe('.initializePresets()', () => {
    it('iterates over the given object and uses .initializePreset', () => {
      const presetA: [string, string[]] = ['presetNameA', ['task1']];
      const presetB: [string, string[]] = ['presetNameB', ['task2']];

      api.initializePreset = spy();
      api.initializePresets(gulpMock, {
        [presetA[0]]: presetA[1],
        [presetB[0]]: presetB[1]
      });

      expect.equal(api.initializePreset.calledWith(gulpMock, presetA[0], presetA[1]), true);
      expect.equal(api.initializePreset.calledWith(gulpMock, presetB[0], presetB[1]), true);
    });
  });

  describe('.initialize()', () => {
    it('warns about the deprecation', () => {
      api.initialize(gulpMock, {});
      const expectedDeprecationMessage = '.initialize method will be deprecated in the next major version. Please use .initializeTasks or .initializePresets methods instead.';
      expect.equal(loggerServiceMock.warn.calledWith(expectedDeprecationMessage), true);
    });

    context('when config contains a key which defines a tool', () => {
      let tool;
      let initializePreset;
      beforeEach(() => {
        tool = {register: spy()};
        toolServiceMock.getTool = spy(() => tool);
        api.initializePreset = initializePreset = spy();
      });

      it('handles the key as a tool and registers it', () => {
        const toolName = 'tool';
        const toolConfig = {};
        api.initialize(gulpMock, {[toolName]: toolConfig});

        expect.equal(toolServiceMock.getTool.calledWith(toolName), true);
        expect.equal(tool.register.calledWith(gulpMock, toolName, toolConfig), true);
        expect.equal(initializePreset.called, false);
      });
    });

    context('when config contains a key which does not define a tool', () => {
      let error;
      let initializePreset;
      beforeEach(() => {
        error = new Error();
        toolServiceMock.getTool = spy(() => {
          throw error;
        });
        api.initializePreset = initializePreset = spy();
      });

      it('handles the key as a preset and registers it', () => {
        const presetName = 'preset';
        const presetConfig = [];
        api.initialize(gulpMock, {[presetName]: presetConfig});

        expect.equal(toolServiceMock.getTool.calledWith(presetName), true);
        expect.equal(initializePreset.calledWith(gulpMock, presetName, presetConfig), true);
      });
    });
  });
});
