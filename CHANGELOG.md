# Changelog

## Unreleased
- Introduce ```check-dependencies``` task
- Improve lazy dependency installation
    - Allow global installation
        use ```global``` parameter of ```install-dependencies``` command
    - Allow linking modules instead of plain installation
        use ```link``` parameter of ```install-dependencies``` command
        or ```allowLinking```global configuration
- Fix ```.initialize()``` api
    - If given configuration is a function,
     the returned object won't be merged with defaults

## 0.5.0 (2016-02-23)
- Introduce ```install-dependencies``` command
- Add verbose parameter to ```npm-install``` task
- Update dependencies
- Update eslint airbnb config (6.x.x)

## 0.4.2 (2016-02-19)
- Fix ```jest``` tasks (globals are not working in parallel mode)

## 0.4.1 (2016-02-10)
- CLI interface is public from now on
- Introduce ```jest:watch``` task
- Introduce ```webpack:watch``` task
    BREAKING CHANGE:
    - ```watch``` option has been removed from the ```webpack``` configuration
        - use ```webpack:watch``` task instead
    - the parameters of the task is the webpack config itself from now on
        - see api documentation
- Defaults of the ```webpack``` has been changed
    - all of the node_modules are handled as externals not to bundle them

## 0.3.3 (2016-02-04)
- Fix jscs:fix task
- Fix package.json (bin path)

## 0.3.1 (2016-02-04)
- Fix shell tasks (handle spaces in path properly)
- Support npm 2
- Introduce lazy dependency load
    BREAKING CHANGE:
    - ```defaults``` has been removed from the public api
        - use the function form of the settings to get the
        task specific defaults as first argument
    - ```globals``` has been removed from the public api
        - no alternative
- Tasks are needed to be turned on explicitly from now on
    BREAKING CHANGE:
    - specify exactly your needs in the ```.initialize()``` api

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
