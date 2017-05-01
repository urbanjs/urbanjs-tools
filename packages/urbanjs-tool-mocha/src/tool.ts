import {isAbsolute, join} from 'path';
import {omit} from 'lodash';
import * as istanbul from 'istanbul';
import * as thresholdChecker from 'istanbul-threshold-checker';
import * as through2 from 'through2';
import * as gulp from 'gulp';
import {cpus} from 'os';
import {inject, injectable} from 'inversify';
import {
  ITool,
  IConfigService,
  ILoggerService,
  IShellService,
  ITaskService,
  IFileSystemService,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_TASK,
  TYPE_SERVICE_FILE_SYSTEM,
  track,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '@tamasmagedli/urbanjs-tools-core';
import {defaults} from './defaults';
import {
  MochaConfig,
  MochaOptions,
  RunnerOptions,
  Message,
  RunnerMessage,
  CoverageOptions,
  Runner
} from './types';
import * as messages from './messages';

@injectable()
export class Mocha implements ITool<MochaConfig> {
  private shellService: IShellService;
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;
  private fsService: IFileSystemService;
  private numberOfMessages: number;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_SHELL) shellService: IShellService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_FILE_SYSTEM) fsService: IFileSystemService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.shellService = shellService;
    this.taskService = taskService;
    this.fsService = fsService;
    this.numberOfMessages = 0;

    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: MochaConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const config = this.configService.mergeParameters<MochaConfig>(defaults, parameters, taskName);
        if (config.collectCoverage) {
          const coverageDirectoryPath = config.coverageDirectory || 'coverage';
          config.coverageDirectory = isAbsolute(coverageDirectoryPath)
            ? coverageDirectoryPath
            : join(process.cwd(), coverageDirectoryPath);

          await this.fsService.remove(config.coverageDirectory);
        }

        const mochaConfig = <MochaOptions>omit(config, 'files', 'maxConcurrency', 'runnerMemoryUsageLimit');
        const runnerMemoryUsageLimit = config.runnerMemoryUsageLimit || 0;
        const maxConcurrency = config.maxConcurrency > 0
          ? config.maxConcurrency
          : cpus().length;
        const runnerOptions: RunnerOptions = {
          runnerMemoryUsageLimit,
          maxConcurrency
        };

        let filesets = [[]];
        [].concat(config.files).forEach((glob) => {
          if (glob instanceof Array) {
            filesets.push(glob);
          } else {
            filesets[0].push(glob);
          }
        });
        filesets = filesets.filter(fileset => fileset.length);

        await this.runFilesetsInParallel(filesets, mochaConfig, runnerOptions);
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });

    const watchTaskName = `${taskName}:watch`;
    this.taskService.addTask(watchTaskName, [], async () => {
      const config = this.configService.mergeParameters<MochaConfig>(defaults, parameters, watchTaskName);
      gulp.watch(config.files, () => this.taskService.runTask(taskName));
    });
  }

  private getNewMessageId() {
    this.numberOfMessages += 1;
    return `${this.numberOfMessages}`;
  }

  private createNewRunner(mochaConfig: MochaOptions): Promise<Runner> {
    return new Promise((resolve, reject) => {
      let initialized = false;
      const initMessageId = this.getNewMessageId();
      const runner = <Runner>this.shellService.forkProcess(require.resolve('./runner'), [], {silent: true});

      let outputBuffer = [];
      const showOutput = () => {
        if (outputBuffer.length) {
          console.log(outputBuffer.join('')); //tslint:disable-line
          outputBuffer = [];
        }
      };

      runner.stdout.on('data', message => outputBuffer.push(message));
      runner.stderr.on('data', message => outputBuffer.push(message));
      runner.on('message', (message: RunnerMessage) => {
        if (message.type === messages.MESSAGE_DONE) {
          runner.memoryUsage = message.payload.memoryUsage;
          showOutput();

          if (message.payload.target === initMessageId) {
            initialized = true;
            resolve(runner);
          }
        }
      });

      runner.on('close', () => {
        showOutput();

        if (!initialized) {
          this.loggerService.error('Could not setup mocha runners.');
          reject(new Error('Runner cannot be setup'));
        }
      });

      runner.send(<Message>{
        id: initMessageId,
        type: messages.MESSAGE_INIT,
        payload: mochaConfig
      });
    });
  }

  private closeRunner(runner: Runner, mochaConfig: MochaOptions) {
    return new Promise((resolve) => {
      runner.on('close', (code: number) => {
        if (code !== 0) {
          this.loggerService.error('Coverage information could not be collected from runner.');
          runner.send('SIGKILL');
        }

        resolve();
      });

      runner.send(<Message>{
        type: messages.MESSAGE_CLOSE,
        payload: mochaConfig
      });
    });
  }

  private async runFileset(runner: Runner, fileset: string[], mochaConfig: MochaOptions) {
    await new Promise((resolve, reject) => {
      const messageId = this.getNewMessageId();
      runner.on('message', (message: RunnerMessage) => {
        if (message.type === messages.MESSAGE_DONE && message.payload.target === messageId) {
          if (message.payload && message.payload.hasError) {
            reject();
            return;
          }

          resolve();
        }
      });

      runner.send(<Message>{
        id: messageId,
        type: messages.MESSAGE_WORK,
        payload: {
          ...mochaConfig,
          files: fileset
        }
      });
    });
  }

  private async collectCoverageFromParticles(coverageOptions: CoverageOptions) {
    await new Promise((resolve, reject) => {
      const collector = new istanbul.Collector();

      gulp.src(join(coverageOptions.coverageDirectory, '_partial/**/coverage*.json'))
        .pipe(through2.obj((file: { contents: string }, enc, cb: Function) => {
          try {
            collector.add(JSON.parse(file.contents));
          } catch (e) {
            // might throw an error, false alarm
          }

          cb();
        }))
        .on('finish', () => {
          const reporter = new istanbul.Reporter(
            istanbul.config.loadFile(null, {
              reporting: {dir: coverageOptions.coverageDirectory}
            })
          );

          reporter.addAll(coverageOptions.coverageReporters);

          try {
            reporter.write(collector, true, () => null);
          } catch (e) {
            // there is a bug in istanbul reporters and false alarms might happen
          }

          if (coverageOptions.coverageThresholds) {
            const results = thresholdChecker.checkFailures(
              coverageOptions.coverageThresholds,
              collector.getFinalCoverage()
            );

            const passGlobal = (type: { global?: { failed: boolean } }) => !(type.global && type.global.failed);
            const passEach = (type: { each?: { failed: boolean } }) => !(type.each && type.each.failed);
            if (!results.every((type: Object) => passGlobal(type) && passEach(type))) {
              this.loggerService.error('Coverage thresholds are not met');
              reject(new Error('Coverage thresholds'));
              return;
            }
          }

          resolve();
        });
    });
  }

  private runFilesetsInParallel(filesets: string[][], mochaConfig: MochaOptions, runnerOptions: RunnerOptions) {
    let hasError = false;
    const promises: Promise<void>[] = [];
    const freeRunners: Runner[] = [];

    const next = (remainingFilesets: string[][]) => {
      if (remainingFilesets.length < 1) {
        return Promise.all(promises);
      }

      if (freeRunners.length) {
        const currentRunner = freeRunners.pop();
        const currentPromise = this.runFileset(currentRunner, remainingFilesets[0], mochaConfig)
          .catch(() => {
            hasError = true;
          })
          .then(() => {
            if (!runnerOptions.runnerMemoryUsageLimit ||
              currentRunner.memoryUsage.heapTotal < runnerOptions.runnerMemoryUsageLimit) {
              freeRunners.push(currentRunner);
              return Promise.resolve();
            }

            return this.closeRunner(currentRunner, mochaConfig);
          })
          .then(() => {
            promises.splice(promises.indexOf(currentPromise), 1);
          });

        promises.push(currentPromise);

        return next(remainingFilesets.slice(1));
      } else if ((promises.length + freeRunners.length) < runnerOptions.maxConcurrency) {
        return this.createNewRunner(mochaConfig).then((newRunner) => {
          freeRunners.push(newRunner);
          return next(remainingFilesets);
        });
      }

      return Promise.race(promises)
        .then(() => next(remainingFilesets));
    };

    return next(filesets)
      .then(() => Promise.all(freeRunners.map(runner => this.closeRunner(runner, mochaConfig))))
      .then(() => (
        mochaConfig.collectCoverage
          ? this.collectCoverageFromParticles(mochaConfig)
          : null
      ))
      .then(() => {
        if (hasError) {
          throw new Error('Test(s) failed.');
        }
      });
  }
}
