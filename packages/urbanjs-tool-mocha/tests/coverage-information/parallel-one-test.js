import assert from 'assert';
import { covered } from './index';

describe('suite', () => {
  it('caseOne', () => {
    assert.equal(covered('one'), 1);
  });
});
