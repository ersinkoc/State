/**
 * Shallow equality check for two values.
 *
 * Uses Object.is for comparison, which handles NaN correctly
 * and distinguishes between +0 and -0.
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are shallowly equal
 *
 * @example
 * ```typescript
 * shallowEqual(1, 1); // true
 * shallowEqual({ a: 1 }, { a: 1 }); // true
 * shallowEqual({ a: 1 }, { a: 2 }); // false
 * shallowEqual(NaN, NaN); // true
 * ```
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  // Object.is handles NaN and -0/+0 correctly
  if (Object.is(a, b)) {
    return true;
  }

  // If either is not an object (or is null), not equal
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  // Compare keys
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key) || !Object.is((a as any)[key], (b as any)[key])) {
      return false;
    }
  }

  return true;
}
