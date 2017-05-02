import {BabelTransformOptions} from 'urbanjs-tools-core';

export type BabelConfig = {
  files: string | string[] | string[][];
  outputPath: string;
  clean?: boolean;
  babel?: BabelTransformOptions;
  emitOnError?: boolean;
  sourcemap?: {
    loadMaps?: boolean;
  }
};
