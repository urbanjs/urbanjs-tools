export const TAG_TRACK = 'TAG_TRACK';

export function track() {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof target[propertyKey] !== 'function') {
      throw new Error('@track() decorator can be used for methods only');
    }

    descriptor.enumerable = true;
    Reflect.defineMetadata(TAG_TRACK, true, target, propertyKey);
  };
}
