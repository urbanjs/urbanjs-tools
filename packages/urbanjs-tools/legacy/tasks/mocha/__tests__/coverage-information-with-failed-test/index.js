'use strict';

export function covered(by) {
  if (by === 'one') {
    return 1;
  } else if (by === 'two') {
    return 2;
  }

  return 0;
}
