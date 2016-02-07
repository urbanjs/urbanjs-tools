# urbanjs-tools
[![Build Status](https://travis-ci.org/urbanjs/tools.svg?branch=master)](https://travis-ci.org/urbanjs/tools)

Urbanjs-tools is a new concept to start a package.

Every time you'd like to kick off your project you
need to
- set up the development pipeline
- decide which tools are the best at this time
- configure them properly

Main goal of the package is to solve these problems out of the box.

## How to use it?

There are 3 typical phases during the development. The goal is here to support
these phases with relevant commands.

Commands:
- `npm start`: runs the default gulp task, needs to be initialized in the project
- `npm run pre-commit`: run it before a commit to analyze the code base and run the tests
- `npm run pre-release`: run it before the new release to build the project,
generate documentation and run everything that belongs to the pre-commit command

## Why use it?
- less initialization steps around a new project
- common tasks are configured properly and ready to use
    - documentation generation (jsdoc)
    - testing (jest)
    - code validation (eslint, jscs, flow, check-file-names)
    - vulnerability check (nsp)
    - bundling (webpack)
- tasks are updated
- tasks are highly customizable
- clean project dependency list
- all the projects use the same tasks
- all the projects and their tasks can be improved in one step
  by updating a single npm module

## Why not generators?

Generator creates a boilerplate for your project
with all the necessary files but after that the
repository is abandoned. There is no way to use
the new features, affect all of your projects at once.

## Why gulp?

Gulp is a well-known package for setting up a
development pipeline. We can create, overwrite
or even compose tasks in a simple way.
It's a very popular package with a big community
and with many usable tasks. Once we've got gulp,
urbanjs-tools can be integrated seamlessly.

## How to customize?
All of the existing ```tasks``` have got a configuration object, see ```Documentation``` section.
Use those options to slightly modify the tasks.

```Presets``` are composed from ```tasks``` and from other ```presets```.
You can overwrite any of the tasks or even presets in your project. None
of the technical specific tasks are used directly by the presets
to give a chance to replace them as you want.

Tasks:
- ```check-file-names``` - Validator for checking the names of the files
- ```eslint``` - JS linter
- ```eslint:fix``` - JS linter
- ```jest``` - Unit tester
- ```jest:watch``` - Unit tester
- ```jscs``` - Code style checker
- ```jscs:fix``` - Code style fixer
- ```jsdoc``` - API documentation generator
- ```npmInstall``` - Dependency installer
- ```nsp``` - Vulnerability checker
- ```retire``` - Vulnerability checker
- ```webpack``` - Bundler

Presets:
- ```dist``` (```webpack```)
- ```doc``` (```jsdoc```)
- ```test``` (```jest```)
- ```analyse``` (```check-file-names```, ```jscs```, ```eslint```, ```nsp```, ```retire```)
- ```pre-commit``` (```analyze```, ```test```)
- ```pre-release``` (```pre-commit```, ```dist```, ```doc```)

### Example
Let's assume that you'd like to use ```mocha``` instead of ```jest```.
- create the gulp task with the name ```mocha```

    ```gulp.task('mocha', ...);```
- overwrite the ```test``` preset to use ```mocha``` instead of ```jest```

    ```gulp.task('test', ['mocha']);```

With these steps you've got a working ```analyze```,
```pre-commit``` and ```pre-release``` presets but from now on
using ```mocha```.

**Note:**
obviously presets and tasks are simple gulp tasks in the background
but the preset abstraction helps to improve the configuration level.
A technology specific task should not get a general name.

## Documentation
Check out the [API reference](http://urbanjs.github.io/tools/)
for documentation and examples.

## CLI
Install urbanjs-tools globally:

```npm install -g urbanjs-tools```

Use the ```generate``` command to start a
new project with the urbanjs skeleton:

```urbanjs generate -n your-awesome-project```

Use ```-f``` flag to remove the existing folder with
the project name before the generation.

Use ```-h``` for help.

## Roadmap
- Add `flow` support
- Add `deploy support` (pm2)
- Add guides & examples

## Contribution
Highly appreciated any ideas how to make it more powerful.
