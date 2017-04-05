import {join} from 'path';
import {ConventionalChangelogConfig} from './types';

const processCwd = process.cwd();
export const defaults: ConventionalChangelogConfig = {
  changelogFile: join(processCwd, 'CHANGELOG.md'),
  outputPath: processCwd,
  conventionalChangelog: {
    preset: 'angular'
  }
};
