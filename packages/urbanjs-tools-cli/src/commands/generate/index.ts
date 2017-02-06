import {inject, injectable} from 'inversify';
import {basename, isAbsolute, join} from 'path';
import {
  IFileSystemService,
  ILoggerService,
  ICLIService,
  CLIServiceOptions,
  TYPE_SERVICE_CLI_SERVICE,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_FILE_SYSTEM
} from '@tamasmagedli/urbanjs-tools-core';
import {ICommand} from '../../types';
import {InvalidUsageError, CLIError} from '../../errors';
import {help, options} from './config';

type ArgsOptions = {
  force: boolean;
  type: string;
  name: string;
  help: string;
};

@injectable()
export class GenerateCommand implements ICommand {
  private fileSystemService: IFileSystemService;
  private loggerService: ILoggerService;
  private cliService: ICLIService;
  private cliServiceOptions: CLIServiceOptions;

  constructor(@inject(TYPE_SERVICE_CLI_SERVICE) cliService: ICLIService,
              @inject(TYPE_SERVICE_FILE_SYSTEM) fileSystemService: IFileSystemService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService) {
    this.loggerService = loggerService;
    this.fileSystemService = fileSystemService;
    this.cliService = cliService;
    this.cliServiceOptions = {
      messages: {
        usage: help
      },
      options,
      commands: []
    };
  }

  /**
   * Generates the skeleton of the project according to the given arguments.
   * @example
   * Options:
   *  -n or --name  - Required, sets the project & the folder name
   *                  Name can be an absolute path as well
   *  -f or --force - Removes the folder with the given name before the generation
   *
   * run(['-n', 'your-awesome-project', '-f', '-t', 'javascript']);
   */
  public async run(rawArgs: string[]): Promise<void> { //tslint:disable-line max-func-body-length
    let args: ArgsOptions;
    try {
      args = this.cliService.parseArgs<ArgsOptions>(rawArgs, this.cliServiceOptions);
    } catch (e) {
      throw new InvalidUsageError();
    }

    if (args.help) {
      this.cliService.showHelp(this.cliServiceOptions);
      return;
    }

    const force = args.force;
    const isTsProject = args.type === 'ts' || args.type === 'typescript';
    let projectName = args.name;
    let folderPath = join(process.cwd(), projectName);

    if (projectName && isAbsolute(projectName)) {
      folderPath = projectName;
      projectName = basename(projectName);
    }

    if (!projectName) {
      this.loggerService.error(`The given name is invalid: ${args.name}`);
      throw new InvalidUsageError();
    }

    this.loggerService.debug('GenerateCommand.run', `folderPath: ${folderPath}`);
    this.loggerService.debug('GenerateCommand.run', `projectName: ${projectName}`);

    if (force) {
      await this.fileSystemService.remove(folderPath);
    }

    if (await this.fileSystemService.exists(folderPath)) {
      this.loggerService.error([
        `The folder \`${folderPath}\` is existing`,
        force ? ' and cannot be deleted.' : '. Use -f to force to delete it.'
      ].join(''));

      throw new CLIError();
    }

    try {
      const urbanjsVersions = require('../../../versions.json'); //tslint:disable-line
      const packageFilePath = join(__dirname, `./templates/package-${isTsProject ? 'ts' : 'js'}.txt`);
      const rawPackageJSON: {devDependencies: {}} = JSON.parse(await this.fileSystemService.readFile(packageFilePath));
      const packageJSON = {
        name: projectName,
        ...rawPackageJSON,
        devDependencies: Object.keys(rawPackageJSON.devDependencies).reduce(
          (acc, depName) => {
            acc[depName] = urbanjsVersions[depName] || rawPackageJSON.devDependencies[depName];
            return acc;
          },
          {}
        )
      };

      await Promise.all([
        this.fileSystemService.writeFile(
          join(folderPath, 'docs/main.js'),
          '// write here your custom jsdoc documentation...\n'
        ),

        this.fileSystemService.writeFile(
          join(folderPath, 'package.json'),
          JSON.stringify(packageJSON, null, '  ')
        ),

        this.fileSystemService.writeFile(
          join(folderPath, `src/index.${isTsProject ? 'ts' : 'js'}`),
          '// let\'s get started...\n'
        ),

        this.fileSystemService.writeFile(
          join(folderPath, 'README.md'),
          `# ${projectName}\n`
        ),

        this.fileSystemService.writeFile(
          join(folderPath, '.editorconfig'),
          await this.fileSystemService.readFile(join(__dirname, '../../../../../.editorconfig'))
        ),

        this.fileSystemService.writeFile(
          join(folderPath, '.gitattributes'),
          await this.fileSystemService.readFile(join(__dirname, '../../../../../.gitattributes'))
        ),

        this.fileSystemService.writeFile(
          join(folderPath, '.npmignore'),
          await this.fileSystemService.readFile(join(__dirname, 'templates/npmignore.txt'))
        ),

        this.fileSystemService.writeFile(
          join(folderPath, '.gitignore'),
          await this.fileSystemService.readFile(join(__dirname, 'templates/gitignore.txt'))
        ),

        this.fileSystemService.writeFile(
          join(folderPath, 'gulpfile.js'),
          await this.fileSystemService.readFile(join(__dirname, `templates/gulpfile-${isTsProject ? 'ts' : 'js'}.txt`))
        ),

        this.fileSystemService.writeFile(
          join(folderPath, 'docs/__fixtures__/static/main.css'),
          await this.fileSystemService.readFile(join(__dirname, 'templates/jsdoc-main-css.txt'))
        ),

        this.fileSystemService.writeFile(
          join(folderPath, 'docs/__fixtures__/layout.html'),
          await this.fileSystemService.readFile(join(__dirname, 'templates/jsdoc-layout-html.txt'))
        )
      ]);

      this.loggerService.info('Project skeleton has been successfully generated.');
    } catch (err) {
      this.loggerService.error('Project skeleton generation has exited with error');
      throw err;
    }
  }
}
