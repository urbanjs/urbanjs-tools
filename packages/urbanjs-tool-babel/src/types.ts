import {BabelTransformOptions} from '@tamasmagedli/urbanjs-tools-core';

export const TYPE_TOOL_BABEL = Symbol('TYPE_TOOL_BABEL');

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
