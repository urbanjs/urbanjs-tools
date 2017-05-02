import {GlobalConfiguration} from 'urbanjs-tools-core';
import {join} from 'path';
import {CheckDependenciesConfig} from './types';

export function getDefaults(globals: GlobalConfiguration): CheckDependenciesConfig {
  return {
    files: globals.sourceFiles,
    packageFile: join(process.cwd(), 'package.json')
  };
}
