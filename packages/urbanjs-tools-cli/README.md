## urbanjs-tools-cli

### Prerequisite
Install `urbanjs-tools-cli` **globally**:

```
npm install -g urbanjs-tools-cli
urbanjs --help
```

### Project template generation
It can be useful to generate a project template by urbanjs when you start a new project. You can use the ```generate``` command for this purpose :

```
urbanjs generate -n project-name
```

This command creates the project template under the `project-name` folder.

*Use ```--help``` option to get more information about the command.*

#### Generated files & folders
- **.editorconfig**
    - sets default editor settings with regard to code style checkers (eslint & jscs)
- **.gitattributes**
    - handles line endings based on [github recommendations](https://help.github.com/articles/dealing-with-line-endings/)
- **.gitignore**
    - sets paths to ignore from the repository based on the defaults settings of the gulp tasks
- **.npmignore**
    - sets paths to ignore from published package based on the defaults settings of the gulp tasks
- **gulpfile.json**
    - enables default gulp tasks
- **package.json**
    - defines scripts for [development phases](https://github.com/urbanjs/urbanjs-tools/wiki/3---Usage#available-presets) (```pre-commit```, ```pre-release```, ```start```, ```test```)
    - registers necessary production and development dependencies
- **README.md**
    - placeholder for documentation
- **/src**
    - folder for source code including test files
- **/docs**
    - folder for jsdoc documentation files (style & template is configurable within the ```__fixtures__``` folder)

#### Runtime files & folders
- **/coverage**
    Used by ```mocha``` to store code coverage data by default, 
excluded from the repository and from the published package
- **/help**
    Used by ```jsdoc``` to store the generated documentation, 
excluded from the repository by defaults
- **/dist**
    Used by ```babel``` and ```webpack``` to store the generated output
