## urbanjs-tools-core

> Core utilities of `urbanjs-tools` and its subpackages.

## Install

```sh
npm install --save-dev urbanjs-tools-core
```

## Usage

```js
import {Container} from 'inversify';
import {container as core} from 'urbanjs-tools-core';

const container = new Container();
container.load(core);

// use any injectable of the core layer
```
