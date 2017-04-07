import {inject, injectable} from 'inversify';
import * as babylon from 'babylon';
import * as depcheck from 'depcheck';
import * as gulp from 'gulp';
import * as prettyjson from 'prettyjson';
import {dirname, join} from 'path';
import {
  ITool,
  IConfigService,
  ILoggerService,
  IShellService,
  ITaskService,
  IFileSystemService,
  ITranspileService,
  TYPE_SERVICE_TRANSPILE,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_TASK,
  track,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '@tamasmagedli/urbanjs-tools-core';
import {getDefaults} from './defaults';
import {CheckDependenciesConfig} from './types';

@injectable()
export class CheckDependencies implements ITool<CheckDependenciesConfig> {
  private shellService: IShellService;
  private configService: IConfigService;
  private taskService: ITaskService;
  private fsService: IFileSystemService;
  private loggerService: ILoggerService;
  private transpileService: ITranspileService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_SHELL) shellService: IShellService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_FILE_SYSTEM) fsService: IFileSystemService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRANSPILE) transpileService: ITranspileService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.shellService = shellService;
    this.taskService = taskService;
    this.fsService = fsService;
    this.transpileService = transpileService;
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: CheckDependenciesConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const defaults = getDefaults(this.configService.getGlobalConfiguration());
        const config = this.configService.mergeParameters<CheckDependenciesConfig>(defaults, parameters, taskName);

        await Promise.all([
          this.checkOutdatedPackages(config),
          this.checkMissingPackages(config)
        ]);
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }

  private async checkOutdatedPackages(config: CheckDependenciesConfig) {
    const packageFile = config.packageFile;
    const output = await this.shellService.runCommand('npm outdated --json -qq', {cwd: dirname(packageFile)});
    const packages = output.stdout ? JSON.parse(output.stdout) : {};

    // validate only installed dependencies
    const outdatedPackageNames = Object.keys(packages)
      .filter(packageName => packages[packageName].current !== undefined);

    // these dependencies are problematic as they have a newer version which is also allowed to
    // be installed according the semver version.
    // Unless you use shrinkwrap file or fix version numbers you should update these
    // dependencies as soon as possible to avoid potential errors of the newer version.
    const problematicDependencies = outdatedPackageNames.filter((packageName) => {
      const dependency = packages[packageName];
      return dependency.current !== dependency.wanted && dependency.wanted !== 'linked';
    });

    const shrinkwrapExists = await this.fsService.exists(join(dirname(packageFile), 'npm-shrinkwrap.json'));
    const yarnLockExists = await this.fsService.exists(join(dirname(packageFile), 'yarn.lock'));

    // shrinkwrap does not exist...
    if (!shrinkwrapExists && !yarnLockExists && problematicDependencies.length) {
      this.loggerService.error(this.toLogMessage('You have critical outdated packages:', problematicDependencies));

      throw new Error('critical dependencies');
    }

    if (outdatedPackageNames.length) {
      this.loggerService.warn(this.toLogMessage('You have outdated packages, consider to update them', outdatedPackageNames));
    }
  }

  private async checkMissingPackages(config: CheckDependenciesConfig) {
    return new Promise((resolve, reject) => {
      const depcheckOptions = {
        withoutDev: false,
        ignoreBinPackage: false,
        ignoreMatches: [],
        ignoreDirs: [],
        detectors: [
          depcheck.detector.requireCallExpression,
          depcheck.detector.importDeclaration
        ],
        specials: [],
        parsers: {}
      };

      gulp.src(config.files)
        .on('data', (file: { path: string }) => {
          depcheckOptions.parsers[file.path] = [
            (content: string, filename: string) => {
              return babylon.parse(
                this.transpileService.transpile(content, filename),
                {sourceType: 'module'}
              );
            },
            depcheck.special.babel,
            depcheck.special.bin,
            depcheck.special.eslint,
            depcheck.special.webpack
          ];
        })
        .on('end', (err: Error) => {
          if (err) {
            this.loggerService.error('Unable to handle source files.', err);
            reject(new Error('Invalid source files'));
          }

          depcheck(dirname(config.packageFile), depcheckOptions, (stats) => {
            if (Object.keys(stats.missing).length) {
              this.loggerService.error(this.toLogMessage('Missing dependencies:', stats.missing));

              reject(new Error('missing dependencies'));
              return;
            }

            if (stats.dependencies.length) {
              this.loggerService.warn(this.toLogMessage('You might have unused dependencies:', stats.dependencies));
            }
            if (stats.devDependencies.length) {
              this.loggerService.warn(this.toLogMessage('You might have unused devDependencies:', stats.devDependencies));
            }
            if (stats.invalidFiles.length) {
              this.loggerService.warn(this.toLogMessage('Some of your files are unprocessable:', stats.invalidFiles));
            }
            if (stats.invalidDirs.length) {
              this.loggerService.warn(this.toLogMessage('Some of your dirs are not accessible:', stats.invalidDirs));
            }

            resolve();
          });
        });
    });
  }

  private toLogMessage(message: string, list: string[]) {
    return `${message}\n${prettyjson.render(list)}`;
  }
}
