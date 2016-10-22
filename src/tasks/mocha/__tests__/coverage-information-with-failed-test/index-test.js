import assert from 'assert';
import { covered } from './index';

describe('suite', () => {
  it('caseA', () => {
    assert.equal(covered(), 0);
    assert.equal(false, true);
  });
});
