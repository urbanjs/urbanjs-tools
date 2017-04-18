import {NotFoundTool, UrbanjsToolsError} from './errors';
import {equal} from 'assert';

describe('errors', () => {
  describe('UrbanjsToolsError', () => {
    it('derives from Error', () => {
      const error = new NotFoundTool();
      equal(error instanceof Error, true);
    });
  });

  describe('NotFoundTool', () => {
    it('derives from Error', () => {
      const error = new NotFoundTool();
      equal(error instanceof Error, true);
    });

    it('derives from UrbanjsToolsError', () => {
      const error = new NotFoundTool();
      equal(error instanceof UrbanjsToolsError, true);
    });
  });
});
