'use strict';

export function sum(...args:number[]):number {
  return args.reduce((acc, val) => acc + val, 0);
}

export async function sumAsync(...args:number[]) {
  return sum(...args);
}
