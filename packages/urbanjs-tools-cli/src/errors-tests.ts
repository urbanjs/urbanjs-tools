import {InvalidUsageError, CLIError} from './errors';
import {equal} from 'assert';

describe('errors', () => {
  describe('CLIError', () => {
    it('derives from Error', () => {
      const error = new CLIError();
      equal(error instanceof Error, true);
    });
  });

  describe('NotFoundTool', () => {
    it('derives from Error', () => {
      const error = new InvalidUsageError();
      equal(error instanceof Error, true);
    });

    it('derives from CLIError', () => {
      const error = new InvalidUsageError();
      equal(error instanceof CLIError, true);
    });
  });
});
