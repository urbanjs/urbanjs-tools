# urbanjs-tools
[![Build Status](https://travis-ci.org/urbanjs/urbanjs-tools.svg?branch=master)](https://travis-ci.org/urbanjs/urbanjs-tools)

## Usage

Check the [wiki](https://github.com/urbanjs/urbanjs-tools/wiki) for detailed guides e.g.
- [starting a new project](https://github.com/urbanjs/urbanjs-tools/wiki/3.1---How-to-start-new-project)
- [integrating with existing project](https://github.com/urbanjs/urbanjs-tools/wiki/3.2---How-to-integrate-with-existing-project)
- [configuring tasks](https://github.com/urbanjs/urbanjs-tools/wiki/3.3-How-to-configure-tasks)
- [using global configuration](https://github.com/urbanjs/urbanjs-tools/wiki/3.4-How-to-use-globals)
- [handling special use cases](https://github.com/urbanjs/urbanjs-tools/wiki/3.5---How-to-handle-special-use-cases)
- [preinstalling dependencies](https://github.com/urbanjs/urbanjs-tools/wiki/3.6---How-to-preinstall-dependencies)
- [configuring IDEs](https://github.com/urbanjs/urbanjs-tools/wiki/3.7---How-to-configure-the-editors)

### Quick start

Initialize the necessary tasks and presets in your gulpfile.js:
```
const tools = require('urbanjs-tools');
tools.initialize(gulp, {
  babel: true,
  checkDependencies: true,
  checkFileNames: true,
  conventionalChangelog: true,
  eslint: true,
  jsdoc: true,
  mocha: true,
  nsp: true,
  retire: true,
  tslint: true,
  webpack: true
});
```

**And that's it, you're good to go.**

You can run any of the gulp tasks above (e.g. ```gulp eslint```) or you can use these [presets](https://github.com/urbanjs/urbanjs-tools/wiki/3---Usage#available-presets):
- `gulp test`: runs tests (```mocha```)
- `gulp analyse`: analyzes the code base (```check-dependencies```, ```check-file-names```, ```eslint```, ```nsp```, ```retire```)
- `gulp pre-commit`: analyzes the code base and runs tests (```analyse```, ```test```)
- `gulp doc`: generates the documentation (```jsdoc```)
- `gulp dist`: runs the configured transpiler/bundler (```babel```, ```webpack```)
- `gulp changelog`: generates the documentation (```conventional-changelog```)
- `gulp pre-release`: analyzes the code base, runs tests, generates documentation, and transpiles/bundles (```pre-commit```, ```doc```, ```dist```, ```changelog```)

Additionally you can use these modifiers:
- `:fix` (`eslint`)
- `:watch` (`babel`, `webpack`, `mocha`)

e.g. `gulp eslint:fix` or `gulp babel:watch`

## Documentation
Check out the [wiki](https://github.com/urbanjs/urbanjs-tools/wiki) for guides, examples and details.

Also you can find the [API reference](http://urbanjs.github.io/tools/) here.

## Contribution
Highly appreciated any ideas how to make it more powerful.
