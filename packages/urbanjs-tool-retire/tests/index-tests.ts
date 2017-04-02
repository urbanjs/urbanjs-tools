import {join} from 'path';
import * as yargs from 'yargs';
import {
  container,
  IShellService,
  TYPE_SERVICE_SHELL,
  TYPE_DRIVER_YARGS
} from '@tamasmagedli/urbanjs-tools-core';

describe('Retire task', () => {
  let shellService: IShellService;

  before(() => {
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
  });

  it('should pass with secure packages', async () => {
    const commands = [
      ['npm install'],
      ['gulp retire']
    ];

    await shellService.runCommandsInSequence(commands, {
      cwd: join(__dirname, 'valid-project')
    });
  });

  it('should throw error with insecure packages', async () => {
    const commands = [
      ['npm install'],
      ['gulp retire', {
        expectToFail: true,
        expectToLog: 'marked 0.3.5 has known vulnerabilities'
      }]
    ];

    await shellService.runCommandsInSequence(commands, {
      cwd: join(__dirname, 'package-with-vulnerability')
    });
  });

  it('should use default configuration without specific parameters', async () => {
    const commands = [
      ['npm install'],
      ['gulp retire', {
        expectToFail: true,
        expectToLog: 'marked 0.3.5 has known vulnerabilities'
      }]
    ];

    await shellService.runCommandsInSequence(commands, {
      cwd: join(__dirname, 'default-configuration')
    });
  });

  it('should use .retireignore automatically in the project root', async () => {
    const commands = [
      ['npm install'],
      ['gulp retire']
    ];

    await shellService.runCommandsInSequence(commands, {
      cwd: join(__dirname, 'retireignore')
    });
  });

  it('should use the given options of retire cli', async () => {
    const commands = [
      ['npm install'],
      ['gulp retire']
    ];

    await shellService.runCommandsInSequence(commands, {
      cwd: join(__dirname, 'retire-cli-config')
    });
  });

  it('should support command line options', async () => {
    const commands = [
      ['npm install'],
      ['gulp retire --retire.options="--ignorefile custom-retireignore.txt"']
    ];

    await shellService.runCommandsInSequence(commands, {
      cwd: join(__dirname, 'cli-options')
    });
  });
});
