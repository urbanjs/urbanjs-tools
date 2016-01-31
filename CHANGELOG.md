# Changelog

## Unreleased
- Fix shell tasks (handle spaces in path properly)
- __dirname & __filename are polyfilled from now on (webpack)

## 0.2.4 (2016-01-29)
- Fix & ensure normalized line endings

## 0.2.3 (2016-01-29)
- Introduce ```sourceFiles``` global setting (used by eslint, jscs and check-file-names)
- Add JSON loader to the default webpack config
- Enhance error logging of webpack task

## 0.2.2 (2016-01-28)
- Use babel-preset-stage-0
- Fix webpack task

## 0.2.1 (2016-01-27)
- Fix eslint:fix task

## 0.2.0 (2016-01-27)
- Enhance jscs task (extra rules for jsdoc, fix reporter)
- Be strict in ESLint rules (no warnings)
- Introduce jscs:fix task
- Introduce eslint:fix task
- Introduce retire task

## 0.1.11 (2016-01-19)
- Fix jest coverage report
- Fix webpack task (multiple done)
- Enhance configuration support (eslint and jscs tasks)

## 0.1.10 (2016-01-18)
- Introduce globals (common configurations used by multiple tasks)
- Extended README (usage section)
- Initialize dummy default task
- Fix jsdoc executable path (npm v3)

## 0.1.8 (2016-01-15)
- Allow tasks to be disabled
- Extended API documentation

## 0.1.7 (2016-01-11)
- Enhance configuration support of the webpack task
- Add legacy decorator support to babel
- Expose default configuration

## 0.1.6 (2016-01-08)
- Proper JSDoc documentation
- Add configuration options

## 0.1.5 (2016-01-08)
- Bugfix: npm package does not contain the required files (/docs, .npmignore,. gitignore)

## 0.1.1 (2016-01-07)
- First release
