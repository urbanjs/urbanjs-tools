import {inherits} from 'util';

export class UrbanjsToolsError {//tslint:disable-line no-stateless-class
  public message: string;
}

// we can not extend built-in classes
// by `extends` syntax as we are using babel
inherits(UrbanjsToolsError, Error);

export class NotFoundTool extends UrbanjsToolsError {
}

export class InvalidUsage extends UrbanjsToolsError {
}
