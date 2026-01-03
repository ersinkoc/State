/**
 * Omit specified properties from an object.
 *
 * Creates a new object without the specified keys.
 *
 * @typeParam T - The object type
 * @typeParam K - The keys to omit
 * @param obj - The source object
 * @param keys - The keys to omit
 * @returns A new object without the omitted keys
 *
 * @example
 * ```typescript
 * const user = { name: 'John', age: 30, city: 'NYC' };
 * const omitted = omit(user, ['age', 'city']);
 * // { name: 'John' }
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  for (const key of keys) {
    delete (result as any)[key];
  }
  return result;
}
