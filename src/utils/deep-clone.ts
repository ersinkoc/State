/**
 * Deep clone a value, creating copies of nested objects and arrays.
 *
 * Handles:
 * - Primitives (returned as-is)
 * - null and undefined (returned as-is)
 * - Date objects
 * - Arrays
 * - Plain objects
 * - Circular references
 * - Other objects (returned as-is, not cloned)
 *
 * @typeParam T - The type to clone
 * @param value - The value to clone
 * @param seen - Internal map for tracking circular references
 * @returns A deep clone of the value
 *
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(original);
 * cloned.b.c = 3;
 * console.log(original.b.c); // 2 (unchanged)
 * ```
 */
export function deepClone<T>(value: T, seen?: WeakMap<object, unknown>): T {
  // Primitives, null, undefined - return as-is
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Date - create new Date instance
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  // Handle circular references
  if (!seen) {
    seen = new WeakMap();
  }
  if (seen.has(value)) {
    return seen.get(value) as T;
  }
  seen.set(value, value);

  // Array - map and recursively clone
  if (Array.isArray(value)) {
    const cloned = [] as unknown as T;
    seen.set(value, cloned);
    (value as unknown[]).forEach((item, index) => {
      (cloned as unknown[])[index] = deepClone(item, seen);
    });
    return cloned;
  }

  // Plain object - create new object and clone properties
  if (value.constructor === Object) {
    const cloned = {} as T;
    seen.set(value, cloned);
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        (cloned as any)[key] = deepClone((value as any)[key], seen);
      }
    }
    return cloned;
  }

  // For other objects (classes, etc.), return as-is
  // This handles RegExp, Map, Set, and custom classes
  return value;
}
