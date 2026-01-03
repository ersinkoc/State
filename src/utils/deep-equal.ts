/**
 * Deep equality check for two values.
 *
 * Recursively compares objects and arrays.
 * Uses Object.is for primitive comparison.
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are deeply equal
 *
 * @example
 * ```typescript
 * deepEqual(1, 1); // true
 * deepEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true
 * deepEqual({ a: { b: 1 } }, { a: { b: 2 } }); // false
 * deepEqual([1, 2], [1, 2]); // true
 * deepEqual([1, 2], [1, 2, 3]); // false
 * ```
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Object.is handles NaN and -0/+0 correctly
  if (Object.is(a, b)) {
    return true;
  }

  // If either is null or not an object, not equal
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  // Array comparison
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    const arrB = b as unknown[];
    if (a.length !== arrB.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], arrB[i])) {
        return false;
      }
    }
    return true;
  }

  // Object comparison
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !deepEqual((a as any)[key], (b as any)[key])
    ) {
      return false;
    }
  }

  return true;
}
