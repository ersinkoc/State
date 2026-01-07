/**
 * Enhanced subscription system with advanced options.
 *
 * @module subscribe
 */

import type { Store, Selector, EqualityFn, Listener } from './types.js';
import { shallowEqual } from './utils/index.js';

/**
 * Options for enhanced subscriptions.
 *
 * @typeParam T - The store state type
 * @typeParam U - The selected value type
 *
 * @example
 * ```typescript
 * const options: SubscribeOptions<State, number> = {
 *   debounce: 100,
 *   fireImmediately: true,
 *   when: (state) => state.isReady
 * };
 * ```
 */
export interface SubscribeOptions<T, U = T> {
  /** Custom equality function for comparing selected values */
  equalityFn?: EqualityFn<U>;
  /** Fire callback immediately with current state */
  fireImmediately?: boolean;
  /** Debounce notifications (ms) */
  debounce?: number;
  /** Throttle notifications (ms) */
  throttle?: number;
  /** Only fire when condition is met */
  when?: (state: T, prevState: T) => boolean;
}

/**
 * Creates a debounced function.
 */
function createDebounced<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled function.
 */
function createThrottled<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    lastArgs = args;

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        if (lastArgs) {
          fn(...lastArgs);
        }
      }, remaining);
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return throttled;
}

/**
 * Enhanced subscribe function with advanced options.
 *
 * @param store - The store to subscribe to
 * @param selectorOrListener - Selector function or direct listener
 * @param listenerOrOptions - Listener function or options (if no selector)
 * @param options - Subscription options
 * @returns Unsubscribe function
 *
 * @example
 * ```typescript
 * // With debounce
 * const unsubscribe = subscribeWithOptions(
 *   store,
 *   (state) => state.searchQuery,
 *   (query) => performSearch(query),
 *   { debounce: 300 }
 * );
 *
 * // With throttle and condition
 * const unsubscribe = subscribeWithOptions(
 *   store,
 *   (state) => state.scrollPosition,
 *   (pos) => updateUI(pos),
 *   { throttle: 16, when: (state) => state.isVisible }
 * );
 *
 * // Fire immediately
 * const unsubscribe = subscribeWithOptions(
 *   store,
 *   (state) => state.user,
 *   (user) => console.log('User:', user),
 *   { fireImmediately: true }
 * );
 * ```
 */
export function subscribeWithOptions<TState, TSelected>(
  store: Store<TState>,
  selector: Selector<TState, TSelected>,
  listener: Listener<TSelected>,
  options: SubscribeOptions<TState, TSelected> = {}
): () => void {
  const {
    equalityFn = shallowEqual,
    fireImmediately = false,
    debounce,
    throttle,
    when,
  } = options;

  // Validate options
  if (debounce !== undefined && throttle !== undefined) {
    throw new Error('Cannot use both debounce and throttle options');
  }

  // Wrap listener with debounce/throttle if needed
  let wrappedListener: Listener<TSelected> & { cancel?: () => void } = listener;
  let cleanup: (() => void) | null = null;

  if (debounce !== undefined && debounce > 0) {
    const debouncedListener = createDebounced(listener, debounce);
    wrappedListener = debouncedListener;
    cleanup = () => debouncedListener.cancel();
  } else if (throttle !== undefined && throttle > 0) {
    const throttledListener = createThrottled(listener, throttle);
    wrappedListener = throttledListener;
    cleanup = () => throttledListener.cancel();
  }

  // Create conditional listener if 'when' is provided
  let finalListener: Listener<TSelected>;
  let prevState: TState = store.getState();

  if (when) {
    finalListener = (value, prevValue) => {
      const currentState = store.getState();
      if (when(currentState, prevState)) {
        wrappedListener(value, prevValue);
      }
      prevState = currentState;
    };
  } else {
    finalListener = wrappedListener;
  }

  // Fire immediately if requested
  if (fireImmediately) {
    const currentValue = selector(store.getState());
    finalListener(currentValue, currentValue);
  }

  // Subscribe with equality function
  const unsubscribe = store.subscribe(selector, finalListener, equalityFn);

  // Return unsubscribe function that also cleans up debounce/throttle
  return () => {
    unsubscribe();
    if (cleanup) {
      cleanup();
    }
  };
}

/**
 * Create a subscription factory with preset options.
 *
 * @param defaultOptions - Default options for all subscriptions
 * @returns A subscribe function with preset options
 *
 * @example
 * ```typescript
 * const debouncedSubscribe = createSubscriber({ debounce: 100 });
 *
 * const unsubscribe = debouncedSubscribe(
 *   store,
 *   (state) => state.input,
 *   (input) => validate(input)
 * );
 * ```
 */
export function createSubscriber<TState>(
  defaultOptions: SubscribeOptions<TState, any> = {}
): <TSelected>(
  store: Store<TState>,
  selector: Selector<TState, TSelected>,
  listener: Listener<TSelected>,
  options?: SubscribeOptions<TState, TSelected>
) => () => void {
  return <TSelected>(
    store: Store<TState>,
    selector: Selector<TState, TSelected>,
    listener: Listener<TSelected>,
    options: SubscribeOptions<TState, TSelected> = {}
  ) => {
    return subscribeWithOptions(store, selector, listener, {
      ...defaultOptions,
      ...options,
    });
  };
}

/**
 * Subscribe to multiple selectors with a single listener.
 *
 * @param store - The store to subscribe to
 * @param selectors - Object of named selectors
 * @param listener - Listener called when any selector value changes
 * @param options - Subscription options
 * @returns Unsubscribe function
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeToMany(
 *   store,
 *   {
 *     count: (s) => s.count,
 *     name: (s) => s.name,
 *   },
 *   ({ count, name }) => console.log(`${name}: ${count}`)
 * );
 * ```
 */
export function subscribeToMany<TState, TSelectors extends Record<string, Selector<TState, any>>>(
  store: Store<TState>,
  selectors: TSelectors,
  listener: (values: { [K in keyof TSelectors]: ReturnType<TSelectors[K]> }) => void,
  options: Omit<SubscribeOptions<TState, any>, 'equalityFn'> = {}
): () => void {
  const keys = Object.keys(selectors) as (keyof TSelectors)[];
  let prevValues: { [K in keyof TSelectors]: ReturnType<TSelectors[K]> } = {} as any;

  // Initialize prev values
  const state = store.getState();
  for (const key of keys) {
    const selector = selectors[key];
    if (selector) {
      prevValues[key] = selector(state);
    }
  }

  // Create combined selector
  const combinedSelector = (state: TState) => {
    const result: any = {};
    for (const key of keys) {
      const selector = selectors[key];
      if (selector) {
        result[key] = selector(state);
      }
    }
    return result;
  };

  // Custom equality - check each value
  const combinedEqualityFn = (
    a: { [K in keyof TSelectors]: ReturnType<TSelectors[K]> },
    b: { [K in keyof TSelectors]: ReturnType<TSelectors[K]> }
  ) => {
    for (const key of keys) {
      if (!shallowEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  };

  return subscribeWithOptions(
    store,
    combinedSelector,
    listener,
    { ...options, equalityFn: combinedEqualityFn }
  );
}

/**
 * Subscribe only once - automatically unsubscribes after first call.
 *
 * @param store - The store to subscribe to
 * @param selector - Selector function
 * @param listener - Listener called once when value changes
 * @param options - Subscription options
 * @returns Unsubscribe function (can be called to cancel before trigger)
 *
 * @example
 * ```typescript
 * // Wait for user to be loaded
 * subscribeOnce(
 *   store,
 *   (state) => state.user,
 *   (user) => console.log('User loaded:', user),
 *   { when: (state) => state.user !== null }
 * );
 * ```
 */
export function subscribeOnce<TState, TSelected>(
  store: Store<TState>,
  selector: Selector<TState, TSelected>,
  listener: Listener<TSelected>,
  options: SubscribeOptions<TState, TSelected> = {}
): () => void {
  let unsubscribe: (() => void) | null = null;

  const onceListener: Listener<TSelected> = (value, prevValue) => {
    listener(value, prevValue);
    if (unsubscribe) {
      unsubscribe();
    }
  };

  unsubscribe = subscribeWithOptions(store, selector, onceListener, options);
  return unsubscribe;
}
