import {inject, injectable} from 'inversify';
import {track} from '../decorators';
import {
  ILoggerService,
  ITraceService,
  IConfigService,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_TRACE,
  TYPE_SERVICE_LOGGER,
  ITranspileService
} from '../types';

export const TYPE_DRIVER_SOURCE_MAP_SUPPORT = Symbol('TYPE_DRIVER_SOURCE_MAP_SUPPORT');
export const TYPE_DRIVER_BABEL_CORE = Symbol('TYPE_DRIVER_BABEL_CORE');
export const TYPE_DRIVER_GULP_TYPESCRIPT = Symbol('TYPE_DRIVER_GULP_TYPESCRIPT');
export const TYPE_DRIVER_TYPESCRIPT = Symbol('TYPE_DRIVER_TYPESCRIPT');

export type SourceMapSupport = {
  install(options: { handleUncaughtExceptions: boolean, retrieveSourceMap: Function }): void;
};

export type BabelCore = {
  transform(content: string, options: Object): { map: string, code: string };
  util: { canCompile: Function };
};

export type Typescript = {
  transpileModule(content: string, options: Object): { sourceMapText: string, outputText: string };
};

export type GulpTypescript = {
  createProject(options: Object): { options: Object };
};

@injectable()
export class TranspileService implements ITranspileService {
  private loggerService: ILoggerService;
  private configService: IConfigService;
  private sourceMapSupport: SourceMapSupport;
  private babelCore: BabelCore;
  private typescript: Typescript;
  private gulpTypescript: GulpTypescript;

  private sourceMapSupportInstalled: boolean;
  private sourceMaps: Object;
  private cache: Object;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_DRIVER_BABEL_CORE) babelCore: BabelCore,
              @inject(TYPE_DRIVER_GULP_TYPESCRIPT) gulpTypescript: GulpTypescript,
              @inject(TYPE_DRIVER_TYPESCRIPT) typescript: Typescript,
              @inject(TYPE_DRIVER_SOURCE_MAP_SUPPORT) sourceMapSupport: SourceMapSupport) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.sourceMapSupport = sourceMapSupport;
    this.babelCore = babelCore;
    this.gulpTypescript = gulpTypescript;
    this.typescript = typescript;
    traceService.track(this);

    this.cache = {};
    this.sourceMaps = {};
    this.sourceMapSupportInstalled = false;
  }

  @track()
  public installSourceMapSupport() {
    if (this.sourceMapSupportInstalled) {
      this.loggerService.warn('Sourcemaps was configured previously');
      return;
    }

    this.sourceMapSupport.install({
      handleUncaughtExceptions: false,
      retrieveSourceMap: (source) => {
        const map = this.sourceMaps[source];
        return map
          ? {url: null, map}
          : null;
      }
    });

    this.sourceMapSupportInstalled = true;
  }

  public transpile(content: string, filename: string) {
    // TODO: should be configurable via globals
    const ignorePatterns: RegExp[] = [
      /node_modules|bower_components|dist|vendor/,
      /\.min\.js$/
    ];

    // skip node_modules & minified files
    if (ignorePatterns.some(pattern => pattern.test(filename))) {
      return content;
    }

    const cacheKey = this.getCacheKey(content, filename);
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = this.transpileWithoutCache(content, filename);
    }

    return this.cache[cacheKey];
  }

  private getCacheKey(content: string, filename: string) {
    const globals = this.configService.getGlobalConfiguration();
    return JSON.stringify({
      content,
      filename,
      babel: globals.babel,
      typescript: globals.typescript
    });
  }

  private transpileWithoutCache(content: string, filename: string) {
    if (/\.tsx?$/.test(filename)) {
      // use gulp-typescript to convert the settings for tsc
      const tsProject = this.gulpTypescript.createProject({
        ...this.configService.getGlobalConfiguration().typescript,
        typescript: this.typescript,
        sourceMap: false,
        inlineSourceMap: true,
        inlineSources: true,
        declaration: false
      });

      const result = this.typescript.transpileModule(content, {
        compilerOptions: tsProject.options,
        fileName: filename
      });

      const inlineSourcemap = new Buffer(result.sourceMapText, 'binary').toString('base64');
      const codeWithInlineSourcemap = result.outputText
        .replace(/\n\/\/# sourceMappingURL[\s\S]+$/, '')
        .concat('\n//# sourceMappingURL=data:application/json;base64,', inlineSourcemap);

      // also use transform with babel to compile to ES5
      // til ES6 is natively supported by most of the environments
      return this.transformWithBabel(codeWithInlineSourcemap, filename);
    } else if (!this.babelCore.util.canCompile(filename)) {
      // You might use a webpack loader in your project
      // that allows you to load custom files (e.g. css, less, scss).
      // Although it is working with webpack but jest
      // don't know how to handle these files.
      // You should never use these files unmocked
      // otherwise you might encounter unexpected behavior.
      // Changing the content of these files
      // to return the raw content.
      return 'module.exports = '.concat(JSON.stringify(content));
    }

    return this.transformWithBabel(content, filename);
  }

  private transformWithBabel(content: string, filename: string) {
    const result = this.babelCore.transform(content, {
      ...this.configService.getGlobalConfiguration().babel,
      filename,
      ast: false,
      babelrc: false,
      retainLines: true,
      sourceMap: 'both'
    });

    this.sourceMaps[filename] = result.map;

    return result.code;
  }
}
