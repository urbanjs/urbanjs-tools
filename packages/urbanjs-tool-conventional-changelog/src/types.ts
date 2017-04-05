export type ConventionalChangelogConfig = {
  changelogFile: string;
  outputPath: string;
  conventionalChangelog?: Object;
  context?: Object;
  gitRawCommits?: Object;
  conventionalCommitsParser?: Object;
  conventionalChangelogWriter?: Object;
};
