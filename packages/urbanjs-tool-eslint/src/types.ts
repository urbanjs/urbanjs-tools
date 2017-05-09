export type EslintConfig = {
  files: string | string[];
  configFile: string;
  extensions: string[];
  useEslintrc?: boolean;
  rules?: object;
  globals?: object;
  envs?: object;
  rulePaths?: string[];
};
