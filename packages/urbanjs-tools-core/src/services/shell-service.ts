import {inject, injectable} from 'inversify';
import {ChildProcess} from 'child_process';
import {
  ILoggerService,
  IShellService,
  TYPE_SERVICE_LOGGER,
  ITraceService,
  TYPE_SERVICE_TRACE,
  IConfigService,
  TYPE_SERVICE_CONFIG,
  ShellCommandOptions,
  ForkProcessOptions,
  ChildProcessOptions
} from '../types';
import {track} from '../decorators';

export const TYPE_DRIVER_CHILD_PROCESS = Symbol('TYPE_DRIVER_CHILD_PROCESS');

export interface IChildProcessDriver {
  exec(command: string, options: ChildProcessOptions, callback: Function): void;
  fork(modulePath: string, args?: string[], options?: ForkProcessOptions): ChildProcess;
}

@injectable()
export class ShellService implements IShellService {
  private loggerService: ILoggerService;
  private configService: IConfigService;
  private childProcessDriver: IChildProcessDriver;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_DRIVER_CHILD_PROCESS) childProcessDriver: IChildProcessDriver) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.childProcessDriver = childProcessDriver;
    traceService.track(this);
  }

  @track()
  public forkProcess(modulePath: string, args?: string[], options?: ForkProcessOptions = {}) {
    return this.childProcessDriver.fork(modulePath, args, {
      ...this.getChildProcessOptions(options),
      silent: options.silent
    });
  }

  @track()
  public async runCommand(command: string, options?: ShellCommandOptions = {}) {
    const childProcessOptions: ChildProcessOptions = this.getChildProcessOptions(<ChildProcessOptions>options);

    return await new Promise((resolve, reject) => {
      this.loggerService.debug('running command', command, options);
      this.childProcessDriver.exec(command, childProcessOptions, (err, stdout, stderr) => {
        this.loggerService.debug('err', err);
        this.loggerService.debug('stdout', stdout);
        this.loggerService.debug('stderr', stderr);

        if (err && !options.allowToFail && !options.expectToFail) {
          this.loggerService.error(
            `${command} has failed`,
            'error:\n', err,
            'stderr:\n', stderr,
            'stdout:\n', stdout
          );

          reject(err);
          return;
        } else if (!err && options.expectToFail) {
          this.loggerService.error('Command was expected to fail but passed', command);
          reject(new Error('Invalid code'));
          return;
        }

        const output = `${stdout}\n${stderr}`;
        const patterns = [].concat(options.expectToLog || []);
        while (patterns.length) {
          const testRegex = new RegExp(patterns.pop());
          this.loggerService.debug('output expect to contain:', testRegex);

          if (testRegex && !testRegex.test(output)) {
            this.loggerService.error('output does not contain', testRegex.toString(), output);
            throw new Error('Invalid output');
          }
        }

        resolve({stdout, stderr});
      });
    });
  }

  @track()
  public async runCommandsInSequence(commands: (string | ShellCommandOptions)[],
                                     options?: ShellCommandOptions) {
    const results = [];
    while (commands.length) {
      const command = commands.shift();
      results.push(await this.runCommand(command[0], Object.assign({}, options, command[1])));
    }

    return results;
  }

  private getChildProcessOptions(options: ChildProcessOptions = {}) {
    return {
      env: {
        ...process.env,
        URBANJS_DEBUG: process.env.URBANJS_DEBUG,
        urbanJSToolGlobals: JSON.stringify(this.configService.getGlobalConfiguration()),
        ...(options.env || {})
      },
      cwd: options.cwd
    };
  }
}
