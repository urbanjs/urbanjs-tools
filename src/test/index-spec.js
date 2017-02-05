'use strict';

import { equal, deepEqual } from 'assert';
import { spy } from 'sinon';
import urbanjs from '../index';
import globals from '../index-globals';

function createGulpMock() {
  const tasks = {};

  return {
    tasks,
    task: (name, taskNames) => {
      tasks[name] = { tasks: taskNames };
    }
  };
}

describe('Public interface', () => {
  describe('.setGlobalConfiguration() api', () => {
    afterEach(() => {
      delete globals.babel;
    });

    it('should update the global configuration', () => {
      equal(typeof globals.babel, 'object');

      urbanjs.setGlobalConfiguration({
        babel: undefined
      });

      equal(typeof globals.babel, 'undefined');
    });

    it('should fail if unknown global configuration is given', () => {
      let err;

      try {
        urbanjs.setGlobalConfiguration({
          unknown: true
        });
      } catch (e) {
        err = e;
      }

      equal(err && err.message, 'Unknown globals: unknown');
    });

    it('should accept method as configuration', () => {
      urbanjs.setGlobalConfiguration((currentGlobals) => {
        equal(typeof currentGlobals, 'object');
        equal(typeof currentGlobals.babel, 'object');

        currentGlobals.babel = undefined;// eslint-disable-line no-param-reassign
        return currentGlobals;
      });

      equal(typeof globals.babel, 'undefined');
    });

    it('should not allow to modify the reference of the globals in the config method', () => {
      urbanjs.setGlobalConfiguration((currentGlobals) => {
        equal(typeof currentGlobals, 'object');
        equal(typeof currentGlobals.babel, 'object');

        const currentCopy = Object.assign({}, currentGlobals);

        currentGlobals.unknown = true; // eslint-disable-line no-param-reassign

        return currentCopy;
      });

      equal(typeof globals.unknown, 'undefined');
    });

    it('should fail if configuration method does not return an valid object', () => {
      let err;

      try {
        urbanjs.setGlobalConfiguration(() => null);
      } catch (e) {
        err = e;
      }

      equal(err.message, 'Invalid config: null');
    });
  });

  describe('.initializePresets() api', () => {
    let gulpMock;

    beforeEach(() => {
      gulpMock = createGulpMock();
    });

    it('should register presets correctly', () => {
      [
        'babel',
        'babel:watch',
        'check-dependencies',
        'check-file-names',
        'conventional-changelog',
        'eslint',
        'eslint:fix',
        'jest',
        'jest:watch',
        'jsdoc',
        'mocha',
        'mocha:watch',
        'nsp',
        'retire',
        'tslint',
        'webpack',
        'webpack:watch'
      ].forEach(task => gulpMock.task(task, []));

      const presets = {
        changelog: true,
        dist: true,
        'dist:watch': true,
        doc: true,
        test: true,
        'test:watch': true,
        analyze: true,
        'pre-commit': true,
        'pre-release': true
      };

      urbanjs.initializePresets(gulpMock, presets);

      Object.keys(presets).forEach((presetName) => {
        deepEqual(typeof gulpMock.tasks[presetName].tasks, 'function');
      });

      deepEqual(gulpMock.tasks.analyse.tasks, ['analyze']);
    });

    it('should filter unregistered tasks from preset config', () => {
      urbanjs.initializePresets(gulpMock, { changelog: true });
      deepEqual(gulpMock.tasks.changelog.tasks, []);
    });

    it('should filter unregistered tasks from passed config', () => {
      const changelogConfigMock = spy();
      urbanjs.initializePresets(gulpMock, {
        changelog: changelogConfigMock
      });

      deepEqual(changelogConfigMock.calledOnce, true);
      deepEqual(changelogConfigMock.args[0][0], []);

      gulpMock.task('conventional-changelog', []);
      urbanjs.initializePresets(gulpMock, {
        changelog: changelogConfigMock
      });

      deepEqual(changelogConfigMock.calledTwice, true);
      deepEqual(changelogConfigMock.args[1][0], ['conventional-changelog']);
    });

    it('should allow unknown gulp tasks as part of the configuration', () => {
      urbanjs.initializePresets(gulpMock, { changelog: ['unknown'] });
      deepEqual(typeof gulpMock.tasks.changelog.tasks, 'function');
    });
  });

  describe('.initialize() api', () => {
    let gulpMock;
    const originalInitializeTasks = urbanjs.initializeTasks;
    const originalInitializePresets = urbanjs.initializePresets;

    beforeEach(() => {
      gulpMock = createGulpMock();
    });

    afterEach(() => {
      urbanjs.initializeTasks = originalInitializeTasks;
      urbanjs.initializePresets = originalInitializePresets;
    });

    it('should call .initializeTasks() method with the correct configuration', () => {
      const initializeTasksMock = spy();
      urbanjs.initializeTasks = initializeTasksMock;

      urbanjs.initialize(gulpMock, {
        unknown: false,
        mocha: true,
        dist: true
      });

      equal(initializeTasksMock.calledOnce, true);
      const args = initializeTasksMock.args[0];
      equal(args[0], gulpMock);
      deepEqual(args[1], { mocha: true });
    });

    it('should call .initializePresets() method with the correct configuration', () => {
      const initializePresetsMock = spy();
      urbanjs.initializePresets = initializePresetsMock;

      urbanjs.initialize(gulpMock, {
        unknown: false,
        mocha: true,
        dist: true
      });

      equal(initializePresetsMock.calledOnce, true);
      const args = initializePresetsMock.args[0];
      equal(args[0], gulpMock);
      deepEqual(args[1], {
        analyze: true,
        changelog: true,
        dist: true,
        'dist:watch': true,
        doc: true,
        'pre-commit': true,
        'pre-release': true,
        test: true,
        'test:watch': true,
        unknown: false
      });
    });
  });
});
