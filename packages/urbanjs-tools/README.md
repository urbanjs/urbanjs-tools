## urbanjs-tools
> Development stack for node packages

### API documentation

#### .setupInMemoryTranspile()
>Installs in memory transpile and sourcemap support

```js
const tools = require('urbanjs-tools');

// optional
tools.setGlobalConfiguration({
  babel: //...
  typescript: //...
});

tools.setupInMemoryTranspile();
```

#### .setGlobalConfiguration(config)
> Sets global configuration object

```js
const tools = require('urbanjs-tools');
tools.setGlobalConfiguration(currentValues => Object.assign({}, currentValues, {
  typescript: <typescript compiler options>,
  babel: <babel configuration>,
  sourceFiles: <array of source file glob patterns>
});
```

#### .getGlobalConfiguration()
> Returns the global configuration object

```js
const tools = require('urbanjs-tools');
const globals = tools.getGlobalConfiguration();
```

<a name="getTool"></a>
#### .getTool(toolName)
> Returns a registrable gulp tool: (gulp, taskName, parameters) => void

**Please check [Tool configuration](#toolConfig) section for more information about parameters.**

```js
const gulp = require('gulp');
const tools = require('urbanjs-tools');
tools.getTool('mocha').register(gulp, 'test-unit', {
  files: ['src/**']
});
```

#### .initializeTask(gulp, taskName, parameters)
> Uses taskName to find the tool and registers it

**Use [.getTool()](#getTool) to register a task with different name than the name of the tool**

**Please check [Tool configuration](#toolConfig) section for more information about parameters.**

```js
const gulp = require('gulp');
const tools = require('urbanjs-tools');
tools.initializeTask(gulp, 'mocha', {
  files: ['src/**']
});
```

#### .initializeTasks(gulp, parametersByToolName)
> Registers all tasks with their parameters

**Please check [Tool configuration](#toolConfig) section for more information about parameters.**

```js
const gulp = require('gulp');
const tools = require('urbanjs-tools');
tools.initializeTasks(gulp, {
  mocha: {
    files: ['src/**']
  },
  // ...
});
```

#### .initializePreset(gulp, presetName, parameters)
> Registers a preset with its subtasks

**Please check [Preset configuration](#presetConfig) section for more information about parameters.**

```js
const gulp = require('gulp');
const tools = require('urbanjs-tools');
tools.initializePreset(gulp, 'security', ['nsp', 'retire']);
tools.initializePreset(gulp, 'analyse', true);
```

#### .initializePresets(gulp, parametersByPresetName)
> Registers all presets with their subtasks

**Please check [Preset configuration](#presetConfig) section for more information about parameters.**

```js
const gulp = require('gulp');
const tools = require('urbanjs-tools');
tools.initializePresets(gulp, {
  security: ['nsp', 'retire'],
  analyze: true
});
```

#### .initialize(gulp, parametersByTaskNameOrPresetName)
> Registers all tasks and presets with their parameters

```js
const gulp = require('gulp');
const tools = require('urbanjs-tools');
tools.initialize(gulp, {
  mocha: {
    files: ['src/**']
  },
  security: ['nsp', 'retire'],
  analyze: true
});
```

<a name="toolConfig"></a>
### Tool configuration

`parameters` argument can be
- true to use defaults
- object to merge it with defaults on root level
- function to get the defaults and return the final configuration (output won't be merged with defaults)

Defaults of tools can be found in `packages/<tool>/src/defaults.ts` files e.g. [mocha](https://github.com/urbanjs/urbanjs-tools/blob/master/packages/urbanjs-tool-mocha/src/defaults.ts).

<a name="presetConfig"></a>
### Preset Configuration

`parameters` argument can be
- true to use default tasks
- array of task names to use it as is
- function to get the defaults and return the final list of task names

Default preset configuration can be found [here](https://github.com/urbanjs/urbanjs-tools/blob/master/packages/urbanjs-tools/src/presets.ts).





