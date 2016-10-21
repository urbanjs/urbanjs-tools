## Unreleased
- Fix ```mocha``` task
    - Fix parallel execution algorithm
    - Fix message intermixing

<a name="1.2.0"></a>
## [1.2.0](https://github.com/urbanjs/tools/compare/1.1.0...1.2.0) (2016-10-20)
- Improve ```mocha``` task
    - Support parallel execution
        - `maxConcurrency` option to specify the maximum number of concurrent processes
        - `files` option accepts array of arrays of globs to specify concurrent filesets, e.g.
            ```
                {
                    maxConcurrency: 2,
                    files: [
                        globA,
                        globB,
                        [globC, globD],
                        [globE]
                    ]
                }
            ```
            Note: 2 concurrent processes work in parallel with the option above and the third will be started once any of the 2 processes finish
    - Support `collectCoverage` option
        - Support `coverageFrom` options to specify source files
        - Support `coverageDirectory` option (`coverage` by default)
        - Support `coverageReporters` option (see [istanbul](https://www.npmjs.com/package/istanbul) for further details)
        - Support `coverageThresholds` options (see [istanbul-threshold-checker](https://www.npmjs.com/package/istanbul-threshold-checker) for further details)
    - Support both `test` & `tests` folders by default
- Introduce in memory transpile cache
- Update dependencies

<a name="1.1.0"></a>
## [1.1.0](https://github.com/urbanjs/tools/compare/1.0.0...1.1.0) (2016-07-18)
- Introduce ```conventional-changelog``` task & ```changelog``` preset
- Support command line option in gulp tasks
    - e.g. gulp mocha --mocha.grep="pattern"
- Remove ```jscs``` task in favour of ```eslint```
    http://eslint.org/blog/2016/07/jscs-end-of-life
- Update dependencies
    - Be aware of the new `eslint` rules


<a name="1.0.0"></a>
## [1.0.0](https://github.com/urbanjs/tools/compare/0.8.2...1.0.0) (2016-06-17)
- Improve ```.setGlobalConfiguration()``` api
    - Accepts method as configuration, the first parameter is the current global configuration
    - Babel config moved to `.babelrc`
        It can be extended just like the other configs e.g. `.eslintrc`
- Improve ```mocha```
    - Sourcemap support added
- Update dependencies


<a name="0.8.2"></a>
## [0.8.2](https://github.com/urbanjs/tools/compare/0.7.0...0.8.2) (2016-05-31)
- Introduce ```babel``` task
    - Use ```babel``` and ```babel:watch``` tasks to build your project
- Use ```babel-runtime``` instead of ```babel-polyfill```
    https://medium.com/@jcse/clearing-up-the-babel-6-ecosystem-c7678a314bf3#.tu57xznwrŁ
- Typescript support
    - The tasks support typescript source from now on
    - Introduce ```tslint``` task
    - Introduce ```typescript``` option in the ```generate``` command
    - ```babel``` & ```webpack``` tasks generate declaration files as well
- Introduce ```mocha``` & ```mocha:watch``` tasks
    - Supports both `js` & `ts` by default
    - The test folder for mocha is `src/test` by default
- Introduce ```test:watch``` & ```dist:watch``` tasks
- Fix ```check-dependencies``` task
    - Handle ```files``` parameters with ```gulp``` to be consistent with the other tasks
- Update dependencies


<a name="0.7.0"></a>
## [0.7.0](https://github.com/urbanjs/tools/compare/0.6.3...0.7.0) (2016-05-04)
- Improve ```parameter``` functions
    - The given ```defaults``` cannot be modified from the parameter function
- Improve ```jest:watch``` task - use built in support
- Update dependencies
    Breaking changes:
    - eslint-config-airbnb@8.0.0
    - eslint-plugin-react@5.0.1
- Fix ```webpack:watch``` (won't stop after the first compilation anymore)
- Fix npm linking (find global node_modules path correctly)
- Improve ```jsdoc``` and ```retire``` tasks
    BREAKING CHANGE:
    - ```executablePath``` is removed, use ```packagePath``` config instead


<a name="0.6.3"></a>
## [0.6.3](https://github.com/urbanjs/tools/compare/0.6.1...0.6.3) (2016-04-10)
- Update dependencies
- Support flow syntax in ```check-dependencies``` task


<a name="0.6.1"></a>
## [0.6.1](https://github.com/urbanjs/tools/compare/0.6.0...0.6.1) (2016-03-29)
- Update nsp (2.2.1 fails)
- Fix ```check-dependencies``` task


<a name="0.6.0"></a>
## [0.6.0](https://github.com/urbanjs/tools/compare/0.5.0...0.6.0) (2016-03-28)
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


<a name="0.5.0"></a>
## [0.5.0](https://github.com/urbanjs/tools/compare/0.4.2...0.5.0) (2016-02-23)
- Introduce ```install-dependencies``` command
- Add verbose parameter to ```npm-install``` task
- Update dependencies
- Update eslint airbnb config (6.x.x)


<a name="0.4.2"></a>
## [0.4.2](https://github.com/urbanjs/tools/compare/0.4.1...0.4.2) (2016-02-19)
- Fix ```jest``` tasks (globals are not working in parallel mode)


<a name="0.4.1"></a>
## [0.4.1](https://github.com/urbanjs/tools/compare/0.3.3...0.4.1) (2016-02-10)
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


<a name="0.3.3"></a>
## [0.3.3](https://github.com/urbanjs/tools/compare/0.3.1...0.3.3) (2016-02-04)
- Fix jscs:fix task
- Fix package.json (bin path)


<a name="0.3.1"></a>
## [0.3.1](https://github.com/urbanjs/tools/compare/0.2.4...0.3.1) (2016-02-03)
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


<a name="0.2.4"></a>
## [0.2.4](https://github.com/urbanjs/tools/compare/0.2.3...0.2.4) (2016-01-29)
- Fix & ensure normalized line endings


<a name="0.2.3"></a>
## [0.2.3](https://github.com/urbanjs/tools/compare/0.2.2...0.2.3) (2016-01-28)
- Introduce ```sourceFiles``` global setting (used by eslint, jscs and check-file-names)
- Add JSON loader to the default webpack config
- Enhance error logging of webpack task


<a name="0.2.2"></a>
## [0.2.2](https://github.com/urbanjs/tools/compare/0.2.1...0.2.2) (2016-01-27)
- Use babel-preset-stage-0
- Fix webpack task


<a name="0.2.1"></a>
## [0.2.1](https://github.com/urbanjs/tools/compare/0.2.0...0.2.1) (2016-01-27)
- Fix eslint:fix task


<a name="0.2.0"></a>
## [0.2.0](https://github.com/urbanjs/tools/compare/0.1.11...0.2.0) (2016-01-27)
- Enhance jscs task (extra rules for jsdoc, fix reporter)
- Be strict in ESLint rules (no warnings)
- Introduce jscs:fix task
- Introduce eslint:fix task
- Introduce retire task


<a name="0.1.11"></a>
## [0.1.11](https://github.com/urbanjs/tools/compare/0.1.10...0.1.11) (2016-01-19)
- Fix jest coverage report
- Fix webpack task (multiple done)
- Enhance configuration support (eslint and jscs tasks)


<a name="0.1.10"></a>
## [0.1.10](https://github.com/urbanjs/tools/compare/0.1.8...0.1.10) (2016-01-18)
- Introduce globals (common configurations used by multiple tasks)
- Extended README (usage section)
- Initialize dummy default task
- Fix jsdoc executable path (npm v3)


<a name="0.1.8"></a>
## [0.1.8](https://github.com/urbanjs/tools/compare/0.1.7...0.1.8) (2016-01-15)
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
