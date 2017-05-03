import {inject, injectable} from 'inversify';
import {
  IStreamService,
  ITraceService,
  TYPE_SERVICE_TRACE
} from '../types';
import {track} from '../decorators';

export const TYPE_DRIVER_THROUGH2 = 'TYPE_DRIVER_THROUGH2';
export const TYPE_DRIVER_FORK_STREAM = 'TYPE_DRIVER_FORK_STREAM';
export const TYPE_DRIVER_DUPLEXIFY = 'TYPE_DRIVER_DUPLEXIFY';
export const TYPE_DRIVER_MERGE_STREAM = 'TYPE_DRIVER_MERGE_STREAM';

export type Through2 = {
  obj(): NodeJS.ReadWriteStream;
};

export type ForkStream = {
  new(options: { classifier: (input: Object, cb: Function) => void }): NodeJS.ReadWriteStream
    & { a: NodeJS.ReadWriteStream, b: NodeJS.ReadWriteStream };
};

export type MergeStream = {
  (streamA: NodeJS.ReadWriteStream, streamB: NodeJS.ReadWriteStream): NodeJS.ReadWriteStream;
};

export type Duplexify = {
  obj(writable: NodeJS.ReadWriteStream, readable: NodeJS.ReadWriteStream): NodeJS.ReadWriteStream;
};

@injectable()
export class StreamService implements IStreamService {
  private through2: Through2;
  private forkStream: ForkStream;
  private mergeStream: MergeStream;
  private duplexify: Duplexify;

  constructor(@inject(TYPE_SERVICE_TRACE) traceService: ITraceService,
              @inject(TYPE_DRIVER_THROUGH2) through2: Through2,
              @inject(TYPE_DRIVER_FORK_STREAM) forkStream: ForkStream,
              @inject(TYPE_DRIVER_MERGE_STREAM) mergeStream: MergeStream,
              @inject(TYPE_DRIVER_DUPLEXIFY) duplexify: Duplexify) {
    this.through2 = through2;
    this.forkStream = forkStream;
    this.mergeStream = mergeStream;
    this.duplexify = duplexify;
    traceService.track(this);
  }

  @track()
  public streamIf(condition: (file: Object) => boolean, conditionStream: NodeJS.ReadWriteStream, options?: { ignoreError?: boolean }) {
    const forkStream = new this.forkStream({
      classifier: (input: Object, cb: Function) => cb(null, condition(input))
    });

    forkStream.a.pipe(conditionStream);

    // merge-stream package cannot be updated because it emits the error
    // from conditionStream to mergedStream
    const mergedStream = this.mergeStream(forkStream.b, conditionStream);
    const outStream = this.through2.obj();
    mergedStream.pipe(outStream);

    const duplexStream = this.duplexify.obj(forkStream, outStream);

    if (!options.ignoreError) {
      conditionStream.on('error', err => duplexStream.emit('error', err));
    }

    return duplexStream;
  }

  @track()
  public mergeStreams(streamA: NodeJS.ReadWriteStream, streamB: NodeJS.ReadWriteStream) {
    return this.mergeStream(streamA, streamB);
  }
}
