import {inject, injectable} from 'inversify';
import {
  ITool,
  IConfigService,
  ILoggerService,
  IShellService,
  ITaskService,
  IFileSystemService,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_SHELL,
  TYPE_SERVICE_TASK,
  track,
  ITraceService,
  TYPE_SERVICE_TRACE
} from 'urbanjs-tools-core';
import {defaults} from './defaults';
import {JSDocConfig} from './types';

@injectable()
export class JSDoc implements ITool<JSDocConfig> {
  private shellService: IShellService;
  private configService: IConfigService;
  private taskService: ITaskService;
  private fsService: IFileSystemService;
  private loggerService: ILoggerService;

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
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: JSDocConfig) {
    this.taskService.addTask(taskName, [], async () => {
      this.loggerService.debug('running task', taskName);

      try {
        const config = this.configService.mergeParameters<JSDocConfig>(defaults, parameters, taskName);
        const jsdocParameters = await this.getJSDocParameters(config.configFile);
        const outputPath = jsdocParameters && jsdocParameters.opts && jsdocParameters.opts.destination;

        if (!outputPath) {
          this.loggerService.error('Config file need to define the output folder');
          throw new Error('Invalid config');
        }

        await this.fsService.remove(outputPath);

        const command = `node "${config.packagePath}jsdoc.js" -c "${config.configFile}"`;
        await this.shellService.runCommand(command);
      } catch (e) {
        this.loggerService.error(`Unexpected error in ${taskName}`, e);
        throw e;
      }
    });
  }

  private async getJSDocParameters(configFilePath: string) {
    try {
      const content = await this.fsService.readFile(configFilePath);
      return JSON.parse(content);
    } catch (e) {
      this.loggerService.error('Config file cannot be found/parsed');
      throw e;
    }
  }
}
