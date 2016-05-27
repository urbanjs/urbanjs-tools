import {asdify} from '../a';

jest.unmock('../a');

describe('suite', () => {
  pit('case', async() => {
    const result = await asdify(1);
    expect(result).toBe('asd1');
  });
});
