export const presets: { [key: string]: string[] } = {
  'changelog': ['conventional-changelog'],
  'dist': ['babel', 'webpack'],
  'dist:watch': ['babel:watch', 'webpack:watch'],
  'doc': ['jsdoc'],
  'test': ['mocha'],
  'test:watch': ['mocha:watch'],
  'analyze': [
    'check-dependencies',
    'check-file-names',
    'jscs',
    'eslint',
    'nsp',
    'retire',
    'tslint'
  ],
  'analyse': ['analyze'],
  'pre-commit': ['analyze', 'test'],
  'pre-release': ['pre-commit', 'dist', 'doc']
};
