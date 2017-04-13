import { deepEqual } from 'assert';
import { Logger } from './index';

describe('suite', () => {
  let messages;

  beforeEach(() => {
    messages = [];

    const logger = new Logger((msg) => {
      messages.push(msg);
    });

    logger.log('asd', 'asd2');
  });

  it('case', async () => {
    deepEqual(messages, ['asd', 'asd2']);
  });
});
