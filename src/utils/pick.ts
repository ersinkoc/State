/**
 * Pick specified properties from an object.
 *
 * Creates a new object with only the specified keys.
 *
 * @typeParam T - The object type
 * @typeParam K - The keys to pick
 * @param obj - The source object
 * @param keys - The keys to pick
 * @returns A new object with only the picked keys
 *
 * @example
 * ```typescript
 * const user = { name: 'John', age: 30, city: 'NYC' };
 * const picked = pick(user, ['name', 'age']);
 * // { name: 'John', age: 30 }
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
