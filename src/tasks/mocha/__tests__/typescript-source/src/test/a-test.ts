import {asdify} from '../a';
import {equal} from 'assert';

describe('suite', () => {
  it('case', async() => {
    const result = await asdify(1);
    equal(result, 'asd1');
  });
});
