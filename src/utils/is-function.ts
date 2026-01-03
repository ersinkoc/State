/**
 * Type guard to check if a value is a function.
 *
 * @param value - The value to check
 * @returns true if the value is a function
 *
 * @example
 * ```typescript
 * const value: unknown = () => {};
 * if (isFunction(value)) {
 *   value(); // TypeScript knows this is a function
 * }
 * ```
 */
export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}
