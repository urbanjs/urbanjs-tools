'use strict';

jest.dontMock('../generate.js');
jest.dontMock('yargs');

const generate = require('../generate');
const mockFs = require('../../lib/fs');
const path = require('path');
const pkg = require('../../../package.json');
const yargs = require('yargs');

describe('CLI - generate command', () => {
  let mockYargs;

  beforeEach(() => {
    // kind of a real yargs...
    mockYargs = yargs.reset();
    mockFs.delete.mockClear();
    mockFs.exists.mockClear();
    mockFs.exists.mockReturnValue(Promise.resolve(false));
    mockFs.readFile.mockClear();
    mockFs.readFile.mockReturnValue(Promise.resolve());
    mockFs.writeFile.mockClear();
  });

  it('accepts options yargs instance as second arguments', () => {
    expect(() => {
      generate.run([]);
    }).not.toThrow();

    mockYargs.showHelp = jest.genMockFunction().mockReturnValue(mockYargs);
    generate.run([], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(1);
  });

  it('shows help if there are missing/unknown options', () => {
    mockYargs.showHelp = jest.genMockFunction().mockReturnValue(mockYargs);

    // empty args
    generate.run([], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(1);

    // unknown option given
    mockYargs.reset();
    generate.run(['-uo'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(2);

    // correct args, help is not required
    mockYargs.reset();
    generate.run(['-n', 'asd'], mockYargs);
    expect(mockYargs.showHelp.mock.calls.length).toBe(2);
  });

  pit('returns a promise', () => {
    const promises = [];

    [
      { args: ['-n', 'asd'] },
      { args: ['-n', 'asd', '-f'] },
      { args: ['-n', 'asd', '-e'], error: 'Unknown argument: e' },
      { args: [], error: 'Missing required argument: n' },
      { args: ['-f'], error: 'Missing required argument: n' }
    ].forEach(options => {
      mockYargs.reset();
      let promise = generate.run(options.args, mockYargs);
      expect(promise instanceof Promise).toBe(true);

      if (options.error) {
        promise = promise.catch(err => {
          expect(err.message).toBe(options.error);
        });
      }

      promises.push(promise);
    });

    return Promise.all(promises);
  });

  pit('uses process.cwd() to define the absolute path of the project', () => {
    return generate.run(['-n', 'projectName'], mockYargs)
      .then(() => {
        expect(mockFs.exists.mock.calls[0]).toEqual([path.join(process.cwd(), 'projectName')]);
      });
  });

  pit('accepts absolute path as project name', () => {
    const absPath = path.join(__dirname, 'project');
    return generate.run(['-n', absPath], mockYargs)
      .then(() => {
        expect(mockFs.exists.mock.calls[0]).toEqual([absPath]);
      });
  });

  pit('fails if the given name is invalid', () => {
    return generate.run(['-n', ''], mockYargs)
      .catch(err => {
        expect(err.message).toBe('The given name is invalid: ');
      });
  });

  pit('fails if the specified folder exists and force options is not used', () => {
    const projectName = 'asd';
    const folderPath = path.join(process.cwd(), projectName);

    mockFs.exists.mockReturnValue(Promise.resolve(true));

    return generate.run(['-n', projectName], mockYargs)
      .catch(err => {
        expect(err.message).toBe(`The folder \`${folderPath}\` is existing. Use -f to force to delete it.`);
      });
  });

  pit('fails if the specified folder cannot be deleted', () => {
    const projectName = 'asd';
    const folderPath = path.join(process.cwd(), projectName);

    mockFs.exists.mockReturnValue(Promise.resolve(true));

    return generate.run(['-n', projectName, '-f'], mockYargs)
      .catch(err => {
        expect(mockFs.delete.mock.calls.length).toBe(1);
        expect(mockFs.delete.mock.calls[0]).toEqual([folderPath]);
        expect(err.message).toBe(`The folder \`${folderPath}\` is existing and cannot be deleted.`);
      });
  });

  pit('fills the generates files with the correct content', () => {
    const projectName = 'asd';
    const folderPath = path.join(process.cwd(), projectName);

    [
      'editorconfig',
      'gitattributes',
      'npmignore',
      'gitignore',
      'gulpfile',
      'docsCss',
      'docsLayout'
    ].forEach(value => mockFs.readFile.mockReturnValueOnce(Promise.resolve(value)));

    return generate.run(['-n', projectName], mockYargs).then(() => {
      const packageJSON = {
        name: projectName,
        version: '0.1.0',
        main: 'dist/index.js',
        scripts: {
          start: 'node_modules/.bin/gulp',
          test: 'node_modules/.bin/gulp test',
          'pre-commit': 'node_modules/.bin/gulp pre-commit',
          'pre-release': 'node_modules/.bin/gulp pre-release'
        },
        devDependencies: {
          gulp: '^3.9.0',
          'urbanjs-tools': '^' + pkg.version
        }
      };

      expect(mockFs.readFile.mock.calls).toEqual([
        [path.join(__dirname, '../../../.editorconfig')],
        [path.join(__dirname, '../../../.gitattributes')],
        [path.join(__dirname, '../__skeleton__/npmignore')],
        [path.join(__dirname, '../__skeleton__/gitignore')],
        [path.join(__dirname, '../__skeleton__/gulpfile')],
        [path.join(__dirname, '../../../docs/__fixtures__/static/main.css')],
        [path.join(__dirname, '../../../docs/__fixtures__/layout.html')]
      ]);

      expect(mockFs.writeFile.mock.calls).toEqual([
        [path.join(folderPath, 'docs/main.js'), '// write here your custom jsdoc documentation...\n'],
        [path.join(folderPath, 'package.json'), JSON.stringify(packageJSON, null, '  ')],
        [path.join(folderPath, 'src/index.js'), '// let\'s get started...\n'],
        [path.join(folderPath, 'README.md'), `# ${projectName}\n`],
        [path.join(folderPath, '.editorconfig'), 'editorconfig'],
        [path.join(folderPath, '.gitattributes'), 'gitattributes'],
        [path.join(folderPath, '.npmignore'), 'npmignore'],
        [path.join(folderPath, '.gitignore'), 'gitignore'],
        [path.join(folderPath, 'gulpfile.js'), 'gulpfile'],
        [path.join(folderPath, 'docs/__fixtures__/static/main.css'), 'docsCss'],
        [path.join(folderPath, 'docs/__fixtures__/layout.html'), 'docsLayout']
      ]);
    });
  });
});
