'use strict';

export function testLoggerLib(lib) {
  const logs = [];
  const logger = new lib.Logger(message => logs.push(message));
  logger.log('a', 'b', 'c');
  expect(logs).toEqual(['a', 'b', 'c']);
}
