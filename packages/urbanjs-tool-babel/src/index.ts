import {inject, injectable} from 'inversify';
import * as babelCore from 'babel-core';
import * as duplexify from 'duplexify';
import * as ForkStream from 'fork-stream';
import * as gulp from 'gulp';
import * as babel from 'gulp-babel';
import * as sourcemaps from 'gulp-sourcemaps';
import * as gulpTs from 'gulp-typescript';
import {omit} from 'lodash';
import * as mergeStream from 'merge-stream';
import * as through2 from 'through2';
import * as ts from 'typescript';
import {
  ITool,
  IConfigService,
  ILoggerService,
  ITaskService,
  IFileSystemService,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_TASK,
  track,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '@tamasmagedli/urbanjs-tools-core';
import {defaults} from './defaults';
import {BabelConfig} from './types';

function streamIf(condition: (file: { path: string }) => boolean, conditionStream: NodeJS.ReadableStream, options?: { ignoreError?: boolean }) {
  const forkStream = new ForkStream({
    classifier: (file, cb) => cb(null, condition(file))
  });

  forkStream.a.pipe(conditionStream);

  // merge-stream package cannot be updated because it emits the error
  // from conditionStream to mergedStream
  const mergedStream = mergeStream(forkStream.b, conditionStream);
  const outStream = through2.obj();
  mergedStream.pipe(outStream);

  const duplexStream = duplexify.obj(forkStream, outStream);

  if (!options.ignoreError) {
    conditionStream.on('error', err => duplexStream.emit('error', err));
  }

  return duplexStream;
}

@injectable()
export class Tool implements ITool<BabelConfig> {
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;
  private fsService: IFileSystemService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_FILE_SYSTEM) fsService: IFileSystemService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.taskService = taskService;
    this.fsService = fsService;
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: BabelConfig) {
    this.taskService.addTask(taskName, [], async () => {
      const config = this.configService.mergeParameters<BabelConfig>(
        {
          ...defaults,
          babel: this.configService.getGlobalConfiguration().babel
        },
        parameters,
        taskName
      );

      if (config.clean) {
        await this.fsService.remove(config.outputPath);
      }

      let stream = gulp.src(config.files);
      if (config.sourcemap !== false) {
        stream = stream.pipe(sourcemaps.init(config.sourcemap));
      }

      let tsConfig = this.configService.getGlobalConfiguration().typescript;
      if (tsConfig.extends) {
        tsConfig = gulpTs.createProject(tsConfig.extends, omit(tsConfig, 'extends')).config.compilerOptions;
      }

      const tsPipe = gulpTs({
        ...tsConfig,
        typescript: ts,
        inlineSourceMap: true
      });
      const dtsPipe = tsPipe.dts.pipe(gulp.dest(config.outputPath));

      stream = stream.pipe(streamIf(
        file => /\.tsx?$/.test(file.path),
        tsPipe,
        {ignoreError: config.emitOnError !== false}
      ));

      stream = stream.pipe(streamIf(
        file => babelCore.util.canCompile(file.path),
        babel(config.babel),
        {ignoreError: config.emitOnError !== false}
      ));

      if (config.sourcemap !== false) {
        stream = stream.pipe(streamIf(
          file => babelCore.util.canCompile(file.path),
          sourcemaps.write('.', config.sourcemap || {}),
          {ignoreError: config.emitOnError !== false}
        ));
      }

      stream = stream.pipe(gulp.dest(config.outputPath));
      return mergeStream(stream, dtsPipe);
    });

    const watchTaskName = `${taskName}:watch`;
    this.taskService.addTask(watchTaskName, [], async () => {
      const config = this.configService.mergeParameters<BabelConfig>(defaults, parameters, taskName);
      gulp.watch(config.files, () => this.taskService.runTask(taskName));
    });
  }
}
