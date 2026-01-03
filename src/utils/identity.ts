/**
 * Identity function that returns its input.
 *
 * Useful as a default selector when no transformation is needed.
 *
 * @typeParam T - The value type
 * @param value - The value to return
 * @returns The same value
 *
 * @example
 * ```typescript
 * const selector = identity;
 * selector(42); // 42
 * selector('hello'); // 'hello'
 * ```
 */
export function identity<T>(value: T): T {
  return value;
}
