export type TslintConfig = {
  files: string | string[];
  configFile: string;
  extensions: string[];
  formatter?: string;
  formattersDirectory?: string;
  rulesDirectory?: string;
  fix?: boolean;
};
