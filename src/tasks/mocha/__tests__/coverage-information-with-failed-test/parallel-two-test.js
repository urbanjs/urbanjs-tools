import assert from 'assert';
import { covered } from './index';

describe('suite', () => {
  it('caseTwo', () => {
    assert.equal(covered('two'), 2);
  });
});
