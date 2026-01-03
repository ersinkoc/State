/**
 * Deep merge a partial object into a target object.
 *
 * Creates a new object with nested objects merged recursively.
 * Arrays are replaced, not merged.
 *
 * @typeParam T - The target type
 * @param target - The target object
 * @param source - The partial source to merge
 * @returns A new merged object
 *
 * @example
 * ```typescript
 * const target = { a: 1, b: { c: 2, d: 3 } };
 * const source = { b: { c: 10 }, e: 4 };
 * const merged = deepMerge(target, source);
 * // { a: 1, b: { c: 10, d: 3 }, e: 4 }
 * ```
 */

import type { DeepPartial } from '../types.js';
import { deepClone } from './deep-clone.js';

export function deepMerge<T>(target: T, source: Partial<T> | DeepPartial<T>): T {
  if (source === null) {
    return target;
  }
  if (typeof source !== 'object') {
    return source as T;
  }

  // Deep clone target to avoid reference issues with Date objects
  const output = deepClone(target) as any;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = (source as any)[key];
      const targetValue = output[key];

      // Date objects - clone and replace
      if (sourceValue instanceof Date) {
        output[key] = new Date(sourceValue.getTime());
        continue;
      }

      // Both are plain objects (but not arrays) - recursively merge
      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        !(sourceValue instanceof Date) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue) &&
        !(targetValue instanceof Date)
      ) {
        output[key] = deepMerge(targetValue, sourceValue as any);
      } else {
        // Replace with cloned value
        output[key] = cloneValue(sourceValue);
      }
    }
  }

  return output;
}

/**
 * Clone a value for merging.
 */
function cloneValue(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (Array.isArray(value)) {
    return value.map((v) => cloneValue(v));
  }

  if (value.constructor === Object) {
    const cloned: Record<string, unknown> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        cloned[key] = cloneValue((value as any)[key]);
      }
    }
    return cloned;
  }

  return value;
}
