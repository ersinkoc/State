/**
 * Computed values (derived state) with memoization.
 *
 * @module computed
 */

import type { Store, Selector, EqualityFn } from './types.js';
import { shallowEqual } from './utils/index.js';

/**
 * Options for computed values.
 *
 * @typeParam T - The store state type
 * @typeParam U - The computed value type
 */
export interface ComputedOptions<T, U> {
  /** Custom equality for caching */
  equals?: EqualityFn<U>;
  /** Lazy evaluation (only compute when accessed) */
  lazy?: boolean;
  /** Keep last N values in cache for time-travel debugging */
  cacheSize?: number;
}

/**
 * Computed value interface with getter and utilities.
 */
export interface Computed<U> {
  /** Get the computed value */
  (): U;
  /** Get value (alias) */
  get(): U;
  /** Force recomputation */
  invalidate(): void;
  /** Subscribe to value changes */
  subscribe(listener: (value: U, prevValue: U) => void): () => void;
  /** Get cache history (if cacheSize > 1) */
  getHistory(): U[];
  /** Destroy and cleanup */
  destroy(): void;
}

/**
 * Cache entry for computed values.
 */
interface CacheEntry<T, U> {
  input: T;
  output: U;
}

/**
 * Create a computed (derived) value from store state.
 *
 * Computed values are memoized and only recompute when dependencies change.
 *
 * @param store - The store to derive from
 * @param selector - Function to compute the derived value
 * @param options - Computed options
 * @returns A computed value accessor
 *
 * @example
 * ```typescript
 * const store = createStore({ items: [], filter: 'all' });
 *
 * // Simple computed
 * const filteredItems = computed(store, (state) => {
 *   if (state.filter === 'all') return state.items;
 *   return state.items.filter(item => item.status === state.filter);
 * });
 *
 * console.log(filteredItems()); // Get computed value
 *
 * // With caching for debugging
 * const total = computed(
 *   store,
 *   (state) => state.items.reduce((sum, item) => sum + item.price, 0),
 *   { cacheSize: 10 }
 * );
 *
 * console.log(total.getHistory()); // See past values
 * ```
 */
export function computed<TState, TComputed>(
  store: Store<TState>,
  selector: Selector<TState, TComputed>,
  options: ComputedOptions<TState, TComputed> = {}
): Computed<TComputed> {
  const { equals = shallowEqual, lazy = false, cacheSize = 1 } = options;

  // Cache storage
  const cache: CacheEntry<TState, TComputed>[] = [];
  let currentValue: TComputed | undefined;
  let isInitialized = false;
  let isDestroyed = false;

  // Listeners for value changes
  const listeners = new Set<(value: TComputed, prevValue: TComputed) => void>();

  // Unsubscribe from store
  let unsubscribe: (() => void) | null = null;

  /**
   * Compute and cache the value.
   */
  const compute = (): TComputed => {
    const state = store.getState();

    // Check cache
    for (const entry of cache) {
      if (entry.input === state || shallowEqual(entry.input, state)) {
        return entry.output;
      }
    }

    // Compute new value
    const newValue = selector(state);

    // Add to cache
    cache.unshift({ input: state, output: newValue });

    // Trim cache
    while (cache.length > cacheSize) {
      cache.pop();
    }

    return newValue;
  };

  /**
   * Initialize computed value and subscription.
   */
  const initialize = () => {
    if (isInitialized || isDestroyed) return;
    isInitialized = true;

    // Compute initial value
    currentValue = compute();

    // Subscribe to store changes
    unsubscribe = store.subscribe((state, prevState) => {
      const prevValue = currentValue!;
      const newValue = compute();

      if (!equals(newValue, prevValue)) {
        currentValue = newValue;

        // Notify listeners
        for (const listener of listeners) {
          try {
            listener(newValue, prevValue);
          } catch (error) {
            console.error('Computed listener error:', error);
          }
        }
      }
    });
  };

  // Initialize immediately if not lazy
  if (!lazy) {
    initialize();
  }

  /**
   * Get the computed value.
   */
  const get = (): TComputed => {
    if (isDestroyed) {
      throw new Error('Cannot access destroyed computed value');
    }

    // Lazy initialization
    if (!isInitialized) {
      initialize();
    }

    return currentValue!;
  };

  /**
   * Invalidate cache and force recomputation.
   */
  const invalidate = (): void => {
    if (isDestroyed) return;

    cache.length = 0;
    if (isInitialized) {
      const prevValue = currentValue!;
      currentValue = compute();

      if (!equals(currentValue, prevValue)) {
        for (const listener of listeners) {
          try {
            listener(currentValue, prevValue);
          } catch (error) {
            console.error('Computed listener error:', error);
          }
        }
      }
    }
  };

  /**
   * Subscribe to value changes.
   */
  const subscribe = (
    listener: (value: TComputed, prevValue: TComputed) => void
  ): (() => void) => {
    if (isDestroyed) {
      throw new Error('Cannot subscribe to destroyed computed value');
    }

    // Ensure initialized
    if (!isInitialized) {
      initialize();
    }

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  /**
   * Get cache history.
   */
  const getHistory = (): TComputed[] => {
    return cache.map((entry) => entry.output);
  };

  /**
   * Destroy computed value.
   */
  const destroy = (): void => {
    if (isDestroyed) return;
    isDestroyed = true;

    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    listeners.clear();
    cache.length = 0;
    currentValue = undefined;
  };

  // Create the computed function
  const computedFn = get as Computed<TComputed>;
  computedFn.get = get;
  computedFn.invalidate = invalidate;
  computedFn.subscribe = subscribe;
  computedFn.getHistory = getHistory;
  computedFn.destroy = destroy;

  return computedFn;
}

/**
 * Create a computed value that depends on other computed values.
 *
 * @param computeds - Array of computed values to depend on
 * @param combiner - Function to combine the computed values
 * @param options - Computed options
 * @returns A combined computed value
 *
 * @example
 * ```typescript
 * const subtotal = computed(store, (s) => s.items.reduce((sum, i) => sum + i.price, 0));
 * const tax = computed(store, (s) => s.taxRate);
 *
 * const total = combineComputed(
 *   [subtotal, tax],
 *   ([subtotalVal, taxVal]) => subtotalVal * (1 + taxVal)
 * );
 *
 * console.log(total()); // Subtotal + tax
 * ```
 */
export function combineComputed<TInputs extends Computed<any>[], TOutput>(
  computeds: [...TInputs],
  combiner: (values: { [K in keyof TInputs]: TInputs[K] extends Computed<infer U> ? U : never }) => TOutput,
  options: Omit<ComputedOptions<any, TOutput>, 'lazy'> = {}
): Computed<TOutput> {
  const { equals = shallowEqual, cacheSize = 1 } = options;

  let currentValue: TOutput | undefined;
  let isDestroyed = false;
  const listeners = new Set<(value: TOutput, prevValue: TOutput) => void>();
  const unsubscribes: (() => void)[] = [];
  const cache: TOutput[] = [];

  /**
   * Compute combined value.
   */
  const compute = (): TOutput => {
    const values = computeds.map((c) => c()) as any;
    return combiner(values);
  };

  // Initialize
  currentValue = compute();
  cache.push(currentValue);

  // Subscribe to all source computeds
  for (const computed of computeds) {
    const unsub = computed.subscribe(() => {
      if (isDestroyed) return;

      const prevValue = currentValue!;
      const newValue = compute();

      if (!equals(newValue, prevValue)) {
        currentValue = newValue;
        cache.unshift(newValue);
        while (cache.length > cacheSize) {
          cache.pop();
        }

        for (const listener of listeners) {
          try {
            listener(newValue, prevValue);
          } catch (error) {
            console.error('Combined computed listener error:', error);
          }
        }
      }
    });
    unsubscribes.push(unsub);
  }

  const get = (): TOutput => {
    if (isDestroyed) {
      throw new Error('Cannot access destroyed computed value');
    }
    return currentValue!;
  };

  const invalidate = (): void => {
    if (isDestroyed) return;
    for (const computed of computeds) {
      computed.invalidate();
    }
  };

  const subscribe = (
    listener: (value: TOutput, prevValue: TOutput) => void
  ): (() => void) => {
    if (isDestroyed) {
      throw new Error('Cannot subscribe to destroyed computed value');
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getHistory = (): TOutput[] => [...cache];

  const destroy = (): void => {
    if (isDestroyed) return;
    isDestroyed = true;
    for (const unsub of unsubscribes) {
      unsub();
    }
    listeners.clear();
    cache.length = 0;
  };

  const combinedFn = get as Computed<TOutput>;
  combinedFn.get = get;
  combinedFn.invalidate = invalidate;
  combinedFn.subscribe = subscribe;
  combinedFn.getHistory = getHistory;
  combinedFn.destroy = destroy;

  return combinedFn;
}

/**
 * Create a memoized selector for use with store.subscribe.
 *
 * @param selector - The selector function to memoize
 * @param equals - Custom equality function
 * @returns A memoized selector
 *
 * @example
 * ```typescript
 * const selectExpensiveComputation = memoizeSelector(
 *   (state: State) => expensiveOperation(state.data)
 * );
 *
 * store.subscribe(selectExpensiveComputation, (result) => {
 *   console.log('Result:', result);
 * });
 * ```
 */
export function memoizeSelector<TState, TSelected>(
  selector: Selector<TState, TSelected>,
  equals: EqualityFn<TSelected> = shallowEqual
): Selector<TState, TSelected> {
  let lastState: TState | undefined;
  let lastResult: TSelected | undefined;
  let isInitialized = false;

  return (state: TState): TSelected => {
    if (!isInitialized || lastState !== state) {
      const newResult = selector(state);

      if (!isInitialized || !equals(newResult, lastResult!)) {
        lastResult = newResult;
      }

      lastState = state;
      isInitialized = true;
    }

    return lastResult!;
  };
}
