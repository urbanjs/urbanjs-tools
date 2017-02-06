import {inherits} from 'util';

export class CLIError {//tslint:disable-line no-stateless-class
}

// we can not extend built-in classes
// by `extends` syntax as we are using babel
inherits(CLIError, Error);

export class InvalidUsageError extends CLIError {
}
