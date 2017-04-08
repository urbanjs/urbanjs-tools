import {ChildProcess} from 'child_process';

export type CoverageOptions = {
  collectCoverage?: boolean;
  coverageDirectory?: string;
  coverageReporters?: string[];
  coverageFrom?: string | string[];
  coverageThresholds?: {
    each?: {
      statements: number;
      branches: number;
      lines: number;
      functions: number;
    };
    global?: {
      statements: number;
      branches: number;
      lines: number;
      functions: number;
    };
  };
};

export type MochaOptions = CoverageOptions & {
  files: string | string[];
  require?: string | string[];
  timeout?: number;
  grep?: string;
};

export type RunnerOptions = {
  maxConcurrency?: number;
  runnerMemoryUsageLimit?: number;
};

export type MochaConfig = MochaOptions & RunnerOptions;

export type Message = {
  id?: string;
  type: 'MESSAGE_INIT' | 'MESSAGE_WORK' | 'MESSAGE_DONE' | 'MESSAGE_CLOSE';
  payload: Object;
};

export type MemoryUsage = {
  heapTotal: number;
};

export type RunnerMessage = Message & {
  payload: {
    target: string;
    memoryUsage: MemoryUsage;
    hasError?: boolean;
  };
};

export type Runner = ChildProcess & {
  memoryUsage: MemoryUsage;
};
