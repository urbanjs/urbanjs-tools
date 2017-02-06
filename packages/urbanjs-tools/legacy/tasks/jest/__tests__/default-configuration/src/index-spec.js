'use strict';

import _ from 'lodash';
import * as a from '../a';
import * as b from '../b';

jest.unmock('../a');

describe('suite', () => {
  it('case', () => {
    // node_modules are unmocked
    expect(typeof _.get).toBe('function');

    // unmock is working
    expect(typeof a.methodA).toBe('function');
    expect(typeof a.methodA.mock).toBe('undefined');

    // local files are mocked
    expect(typeof b.methodB).toBe('function');
    expect(typeof b.methodB.mock).toBe('object');
  });
});
