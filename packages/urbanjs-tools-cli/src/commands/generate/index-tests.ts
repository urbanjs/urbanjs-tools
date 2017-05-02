import * as expect from 'assert';
import {join} from 'path';
import {spy, stub} from 'sinon';
import {GenerateCommand} from './index';
import {CLIError, InvalidUsageError} from '../../errors';

const urbanjsVersions = require('../../../versions.json'); //tslint:disable-line

describe('cli', () => {
  describe('generate command', () => {
    let generateCommand;
    let cliServiceMock;
    let loggerServiceMock;
    let fileSystemServiceMock;

    beforeEach(() => {
      cliServiceMock = {
        parseArgs: spy(),
        showHelp: spy()
      };

      loggerServiceMock = {
        info: spy(),
        error: spy(),
        debug: spy()
      };

      fileSystemServiceMock = {
        writeFile: spy(),
        readFile: spy(() => JSON.stringify({devDependencies: {}})),
        exists: spy(),
        remove: spy()
      };

      generateCommand = new GenerateCommand(
        cliServiceMock,
        fileSystemServiceMock,
        loggerServiceMock
      );
    });

    describe('.run', () => {
      it('returns a promise', () => {
        cliServiceMock.parseArgs = spy(() => ({help: true}));
        expect.equal(generateCommand.run([]) instanceof Promise, true);
      });

      it('throws if the specified folder exists', async () => {
        const projectName = 'project-name';
        const folderPath = join(process.cwd(), projectName);
        cliServiceMock.parseArgs = spy(() => ({name: projectName}));

        fileSystemServiceMock.exists = spy(() => true);

        let result;
        try {
          result = await generateCommand.run([]);
        } catch (e) {
          result = e;
        }

        expect.equal(result instanceof CLIError, true);
        expect.equal(loggerServiceMock.error.calledWith(`The folder \`${folderPath}\` is existing. Use -f to force to delete it.`), true);
      });

      it('generates files with the correct content within the specified project path', async () => {
        const projectName = 'project-name';
        const folderPath = join(process.cwd(), projectName);
        cliServiceMock.parseArgs = spy(() => ({
          name: projectName
        }));

        const rawPackageFile = {
          test: 'test',
          devDependencies: {
            'urbanjs-tool-babel': '*',
            'random': '^1.0.0'
          }
        };
        const readResults = {
          packageFile: {
            path: join(__dirname, './templates/package-js.txt'),
            content: JSON.stringify(rawPackageFile)
          },
          editorconfig: {
            path: join(__dirname, 'templates/editorconfig.txt'),
            content: 'editorconfig'
          },
          gitattributes: {
            path: join(__dirname, 'templates/gitattributes.txt'),
            content: 'gitattributes'
          },
          npmignore: {
            path: join(__dirname, 'templates/npmignore.txt'),
            content: 'npmignore'
          },
          gitignore: {
            path: join(__dirname, 'templates/gitignore.txt'),
            content: 'gitignore'
          },
          gulpfile: {
            path: join(__dirname, 'templates/gulpfile-js.txt'),
            content: 'gulpfile'
          }
        };

        fileSystemServiceMock.readFile = stub();
        Object.keys(readResults).forEach((key) => {
          const item = readResults[key];
          fileSystemServiceMock.readFile.withArgs(item.path).returns(item.content);
        });

        await generateCommand.run([]);

        [
          {
            path: join(folderPath, 'package.json'),
            content: JSON.stringify({
              name: projectName,
              test: 'test',
              devDependencies: {
                'urbanjs-tool-babel': urbanjsVersions['urbanjs-tool-babel'],
                'random': '^1.0.0'
              }
            }, null, '  ')
          },
          {
            path: join(folderPath, 'src/index.js'),
            content: '// let\'s get started...\n'
          },
          {
            path: join(folderPath, 'README.md'),
            content: `# ${projectName}\n`
          },
          {
            path: join(folderPath, '.editorconfig'),
            content: readResults.editorconfig.content
          },
          {
            path: join(folderPath, '.gitattributes'),
            content: readResults.gitattributes.content
          },
          {
            path: join(folderPath, '.npmignore'),
            content: readResults.npmignore.content
          },
          {
            path: join(folderPath, '.gitignore'),
            content: readResults.gitignore.content
          },
          {
            path: join(folderPath, 'gulpfile.js'),
            content: readResults.gulpfile.content
          }
        ].forEach((item) => {
          expect.equal(fileSystemServiceMock.writeFile.calledWith(item.path, item.content), true, JSON.stringify(item));
        });
      });

      context('when invalid options are given', () => {
        it('throws', async () => {
          cliServiceMock.parseArgs = spy(() => {
            throw new Error('invalid options');
          });

          let result;
          try {
            result = await generateCommand.run([]);
          } catch (e) {
            result = e;
          }

          expect.equal(result instanceof InvalidUsageError, true);
        });
      });

      context('when no option is given', () => {
        it('throws', async () => {
          cliServiceMock.parseArgs = spy(() => ({}));

          let result;
          try {
            result = await generateCommand.run([]);
          } catch (e) {
            result = e;
          }

          expect.equal(result instanceof InvalidUsageError, true);
        });
      });

      context('when --help option is given', () => {
        it('it shows the help', async () => {
          cliServiceMock.parseArgs = spy(() => ({help: true}));

          const result = await generateCommand.run([]);
          expect.equal(result, undefined);
          expect.equal(cliServiceMock.showHelp.called, true);
        });
      });

      context('when --name option is given', () => {
        context('and option defines relative path', () => {
          it('uses process.cwd() to define the absolute folder path', async () => {
            const projectName = 'project-name';
            const folderPath = join(process.cwd(), projectName);
            cliServiceMock.parseArgs = spy(() => ({name: projectName}));

            await generateCommand.run([]);
            expect.equal(loggerServiceMock.debug.calledWith('GenerateCommand.run', `folderPath: ${folderPath}`), true);
            expect.equal(loggerServiceMock.debug.calledWith('GenerateCommand.run', `projectName: ${projectName}`), true);
          });
        });

        context('and option defines absolute path', () => {
          it('parses the path and uses the last one as project name', async () => {
            const projectName = 'project-name';
            const folderPath = join(process.cwd(), projectName);
            cliServiceMock.parseArgs = spy(() => ({name: folderPath}));

            await generateCommand.run([]);
            expect.equal(loggerServiceMock.debug.calledWith('GenerateCommand.run', `folderPath: ${folderPath}`), true);
            expect.equal(loggerServiceMock.debug.calledWith('GenerateCommand.run', `projectName: ${projectName}`), true);
          });
        });

        context('and option is invalid', () => {
          it('throws', async () => {
            cliServiceMock.parseArgs = spy(() => ({name: ''}));

            let result;
            try {
              result = await generateCommand.run([]);
            } catch (e) {
              result = e;
            }

            expect.equal(result instanceof InvalidUsageError, true);
          });
        });
      });

      context('when --force option is given', () => {
        it('removes the folder of the project prior the generation', async () => {
          const projectName = 'project-name';
          const folderPath = join(process.cwd(), projectName);
          cliServiceMock.parseArgs = spy(() => ({
            name: projectName,
            force: true
          }));

          await generateCommand.run([]);

          expect.equal(fileSystemServiceMock.remove.calledWith(folderPath), true);
          expect.equal(fileSystemServiceMock.remove.calledBefore(fileSystemServiceMock.exists), true);
        });
      });

      context('when --type option is given', () => {
        it('uses the templates files accordingly', async () => {
          const projectName = 'project-name';
          const folderPath = join(process.cwd(), projectName);
          cliServiceMock.parseArgs = spy(() => ({
            name: projectName,
            type: 'typescript'
          }));

          await generateCommand.run([]);

          [
            join(__dirname, './templates/package-ts.txt'),
            join(__dirname, './templates/gulpfile-ts.txt'),
          ].forEach((path) => {
            expect.equal(fileSystemServiceMock.readFile.calledWith(path), true);
          });

          expect.equal(fileSystemServiceMock.writeFile.calledWith(join(folderPath, 'src/index.ts'), '// let\'s get started...\n'), true);
        });
      });
    });
  });
});
