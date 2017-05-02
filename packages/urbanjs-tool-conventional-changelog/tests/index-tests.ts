import {Container} from 'inversify';
import {join} from 'path';
import * as yargs from 'yargs';
import * as mkdirp from 'mkdirp';
import * as expect from 'assert';
import {
  containerModule as core,
  IShellService,
  IFileSystemService,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_DRIVER_YARGS,
  TYPE_DRIVER_MKDIRP
} from 'urbanjs-tools-core';

describe('Conventional changelog task', () => {
  let shellService: IShellService;
  let fsService: IFileSystemService;

  before(() => {
    const container = new Container();
    container.load(core);
    container.bind(TYPE_DRIVER_YARGS).toConstantValue(yargs);
    container.bind(TYPE_DRIVER_MKDIRP).toConstantValue(mkdirp);
    shellService = container.get<IShellService>(TYPE_SERVICE_SHELL);
    fsService = container.get<IFileSystemService>(TYPE_SERVICE_FILE_SYSTEM);
  });

  it('should generate the changelog successfully', async () => {
    const projectName = 'valid-project';
    const changelogFile = join(__dirname, projectName, 'CHANGELOG.md');

    await fsService.writeFile(changelogFile, '');
    await shellService.runCommand('gulp conventional-changelog', {cwd: join(__dirname, projectName)});
    const content = await fsService.readFile(changelogFile);
    expect.equal(content.length > 0, true);
  });

  it('should use default configuration without specific parameters', async () => {
    const projectName = 'default-configuration';
    const changelogFile = join(__dirname, projectName, 'CHANGELOG.md');

    await fsService.writeFile(changelogFile, '');
    await shellService.runCommand('gulp conventional-changelog', {cwd: join(__dirname, projectName)});
    const content = await fsService.readFile(changelogFile);
    expect.equal(content.length > 0, true);
  });

  it('should support command line options', async () => {
    const projectName = 'cli-options';
    const changelogFile = join(__dirname, projectName, 'CHANGELOG2.md');
    const option = `--conventional-changelog.changelogFile="${changelogFile}"`;

    await fsService.writeFile(changelogFile, '');
    await shellService.runCommand(`gulp conventional-changelog ${option}`, {
      cwd: join(__dirname, projectName)
    });
    const content = await fsService.readFile(changelogFile);
    expect.equal(content.length > 0, true);
  });
});
