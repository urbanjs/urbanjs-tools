import * as expect from 'assert';
import {stub, spy} from 'sinon';
import {Api} from './api';
import {IApi} from './types';

describe('legacy api', () => {
  let gulpMock;
  let toolServiceMock;
  let loggerServiceMock;
  let configServiceMock;
  let api: IApi;

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

    configServiceMock = {};

    api = new Api(toolServiceMock, loggerServiceMock, configServiceMock);
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

    context('when config contains a key which defines a preset', () => {
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
