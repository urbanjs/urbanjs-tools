import {inject, injectable, optional} from 'inversify';
import {readFile, stat, writeFile} from 'fs';
import {dirname} from 'path';
import {
  IFileSystemService,
  ILoggerService,
  TYPE_SERVICE_LOGGER
} from '../types';

export const TYPE_DRIVER_MKDIRP = Symbol('TYPE_DRIVER_MKDIRP');
export const TYPE_DRIVER_DEL = Symbol('TYPE_DRIVER_DEL');

export type Del = (path: string, options: {force: boolean}) => Promise<void>;
export type Mkdirp = (path: string, cb: Function) => Promise<void>;

@injectable()
export class FileSystemService implements IFileSystemService {
  private loggerService: ILoggerService;
  private mkdirp: Mkdirp;
  private del: Del;

  constructor(@inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_DRIVER_MKDIRP) @optional() mkdirp: Mkdirp,
              @inject(TYPE_DRIVER_DEL) @optional() del: Del) {
    this.loggerService = loggerService;
    this.mkdirp = mkdirp;
    this.del = del;
  }

  public async remove(targetPath: string): Promise<void> {
    if (!this.del) {
      throw new Error('TYPE_DRIVER_DEL is not assigned to the container.');
    }

    await this.del(targetPath, {force: true});
  }

  public exists(targetPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      stat(targetPath, err => resolve(!err));
    });
  }

  public readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      readFile(
        filePath,
        'utf8',
        (err, content: string) => {
          if (err) {
            reject(`File cannot be read: ${filePath}`);
            return;
          }

          resolve(content);
        }
      );
    });
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    if (!this.mkdirp) {
      throw new Error('TYPE_DRIVER_MKDIRP is not assigned to the container.');
    }

    await new Promise((resolve, reject) => {
      const folderPath = dirname(filePath);
      this.mkdirp(folderPath, (err) => {
        if (err) {
          reject(`Folder cannot be created: ${folderPath}`);
          return;
        }

        writeFile(
          filePath,
          content,
          (writeErr) => {
            if (writeErr) {
              reject(`File cannot be written: ${filePath}`);
              return;
            }

            resolve();
          }
        );
      });
    });
  }
}
