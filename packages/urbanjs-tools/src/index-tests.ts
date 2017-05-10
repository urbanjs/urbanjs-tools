import * as expect from 'assert';
import {spy} from 'sinon';
import {container} from './container';
import {globals} from './globals';
import {IApi, TYPE_API} from './types';
import {TYPE_SERVICE_CONFIG, IConfigService} from 'urbanjs-tools-core';
import indexFromImport from './index';

describe('index', () => {
  beforeEach(() => {
    container.snapshot();
    delete require.cache[require.resolve('./index')];
  });

  afterEach(() => {
    container.restore();
  });

  it('exposes the api via import', () => {
    expect.equal(indexFromImport, container.get<IApi>(TYPE_API));
  });

  it('exposes the api via require', () => {
    const index = require('./index');
    expect.equal(index, container.get<IApi>(TYPE_API));
  });

  it('all exposed methods are bound to correctly (this works)', () => {
    const publicMethods = {
      setupInMemoryTranspile: spy(),
      getGlobalConfiguration: spy(),
      setGlobalConfiguration: spy(),
      getTool: spy(),
      initializeTask: spy(),
      initializeTasks: spy(),
      initializePreset: spy(),
      initializePresets: spy(),
      initialize: spy()
    };

    const apiMock = {...publicMethods};
    container.rebind<IApi>(TYPE_API).toConstantValue(apiMock);
    const index = require('./index');

    Object.keys(publicMethods).forEach(methodName => {
      const method = index[methodName];
      method();
      expect.equal(publicMethods[methodName].calledOn(apiMock), true);
    });
  });

  it('sets globals automatically', () => {
    const configServiceMock = {
      mergeParameters: spy(),
      setGlobalConfiguration: spy(),
      getGlobalConfiguration: spy()
    };

    container.rebind<IConfigService>(TYPE_SERVICE_CONFIG).toConstantValue(configServiceMock);

    require('./index');

    expect.equal(configServiceMock.setGlobalConfiguration.calledWith(globals), true);
  });
});
