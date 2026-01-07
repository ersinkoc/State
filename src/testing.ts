/**
 * Testing utilities for @oxog/state.
 *
 * Provides helpers for testing stores, state changes,
 * and async effects in unit tests.
 *
 * @module testing
 */

import type { Store, Selector, EqualityFn } from './types.js';
import { createStore } from './store.js';
import { shallowEqual } from './utils/index.js';

/**
 * Mock storage for testing persist plugin.
 */
export interface MockStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  getAll(): Record<string, string>;
}

/**
 * Create a mock storage for testing.
 *
 * @returns A mock storage implementation
 *
 * @example
 * ```typescript
 * import { createMockStorage, persist } from '@oxog/state';
 *
 * const mockStorage = createMockStorage();
 *
 * const store = createStore({ count: 0 })
 *   .use(persist({ key: 'test', storage: mockStorage }));
 *
 * store.setState({ count: 5 });
 * expect(mockStorage.getItem('test')).toBe('{"count":5}');
 * ```
 */
export function createMockStorage(): MockStorage {
  const storage = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      storage.set(key, value);
    },
    removeItem(key: string): void {
      storage.delete(key);
    },
    clear(): void {
      storage.clear();
    },
    getAll(): Record<string, string> {
      const result: Record<string, string> = {};
      for (const [key, value] of storage) {
        result[key] = value;
      }
      return result;
    },
  };
}

/**
 * State change record for tracking.
 */
export interface StateChange<TState> {
  state: TState;
  prevState: TState;
  timestamp: number;
}

/**
 * Store spy for testing state changes.
 */
export interface StoreSpy<TState> {
  /** All recorded state changes */
  changes: StateChange<TState>[];
  /** Get the last state change */
  lastChange: () => StateChange<TState> | undefined;
  /** Get the last state */
  lastState: () => TState | undefined;
  /** Reset recorded changes */
  reset: () => void;
  /** Unsubscribe from store */
  unsubscribe: () => void;
  /** Wait for a specific state condition */
  waitFor: (
    predicate: (state: TState) => boolean,
    timeout?: number
  ) => Promise<TState>;
  /** Wait for a specific number of changes */
  waitForChanges: (count: number, timeout?: number) => Promise<StateChange<TState>[]>;
}

/**
 * Create a spy to track store state changes.
 *
 * @param store - The store to spy on
 * @returns A store spy object
 *
 * @example
 * ```typescript
 * import { createStore, spyOnStore } from '@oxog/state';
 *
 * const store = createStore({ count: 0 });
 * const spy = spyOnStore(store);
 *
 * store.setState({ count: 1 });
 * store.setState({ count: 2 });
 *
 * expect(spy.changes).toHaveLength(2);
 * expect(spy.lastState()?.count).toBe(2);
 * ```
 */
export function spyOnStore<TState>(store: Store<TState>): StoreSpy<TState> {
  const changes: StateChange<TState>[] = [];
  const waiters: Array<{
    resolve: (state: TState) => void;
    predicate: (state: TState) => boolean;
  }> = [];

  const unsubscribe = store.subscribe((state, prevState) => {
    changes.push({
      state,
      prevState,
      timestamp: Date.now(),
    });

    // Check waiters
    for (let i = waiters.length - 1; i >= 0; i--) {
      const waiter = waiters[i];
      if (waiter && waiter.predicate(state)) {
        waiter.resolve(state);
        waiters.splice(i, 1);
      }
    }
  });

  return {
    changes,
    lastChange: () => changes[changes.length - 1],
    lastState: () => changes[changes.length - 1]?.state,
    reset: () => {
      changes.length = 0;
    },
    unsubscribe,
    waitFor: (predicate, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        // Check immediately
        const current = store.getState();
        if (predicate(current)) {
          resolve(current);
          return;
        }

        // Set up waiter
        const waiter = { resolve, predicate };
        waiters.push(waiter);

        // Set timeout
        const timeoutId = setTimeout(() => {
          const index = waiters.indexOf(waiter);
          if (index >= 0) {
            waiters.splice(index, 1);
            reject(new Error(`waitFor timeout after ${timeout}ms`));
          }
        }, timeout);

        // Clear timeout on resolve
        const originalResolve = waiter.resolve;
        waiter.resolve = (state) => {
          clearTimeout(timeoutId);
          originalResolve(state);
        };
      });
    },
    waitForChanges: (count, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const startCount = changes.length;

        const check = () => {
          if (changes.length >= startCount + count) {
            return changes.slice(startCount, startCount + count);
          }
          return null;
        };

        // Check immediately
        const immediate = check();
        if (immediate) {
          resolve(immediate);
          return;
        }

        // Set up interval check
        const intervalId = setInterval(() => {
          const result = check();
          if (result) {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            resolve(result);
          }
        }, 10);

        // Set timeout
        const timeoutId = setTimeout(() => {
          clearInterval(intervalId);
          reject(new Error(`waitForChanges timeout after ${timeout}ms`));
        }, timeout);
      });
    },
  };
}

/**
 * Test helper for asserting state values.
 */
export interface StateAssertion<TState> {
  /** Assert the current state equals expected */
  toEqual: (expected: Partial<TState>) => void;
  /** Assert a selector value equals expected */
  toHaveSelected: <T>(selector: Selector<TState, T>, expected: T) => void;
  /** Assert state matches a predicate */
  toMatch: (predicate: (state: TState) => boolean) => void;
}

/**
 * Create assertions for a store's state.
 *
 * @param store - The store to assert on
 * @returns State assertion helpers
 *
 * @example
 * ```typescript
 * import { createStore, assertState } from '@oxog/state';
 *
 * const store = createStore({ count: 0, name: 'test' });
 * const assert = assertState(store);
 *
 * assert.toEqual({ count: 0 });
 * assert.toHaveSelected(s => s.name, 'test');
 * assert.toMatch(s => s.count >= 0);
 * ```
 */
export function assertState<TState>(store: Store<TState>): StateAssertion<TState> {
  return {
    toEqual: (expected) => {
      const state = store.getState();
      for (const [key, value] of Object.entries(expected)) {
        if ((state as any)[key] !== value) {
          throw new Error(
            `Expected state.${key} to be ${JSON.stringify(value)}, ` +
            `but got ${JSON.stringify((state as any)[key])}`
          );
        }
      }
    },
    toHaveSelected: <T>(selector: Selector<TState, T>, expected: T) => {
      const actual = selector(store.getState());
      if (!shallowEqual(actual, expected)) {
        throw new Error(
          `Expected selector to return ${JSON.stringify(expected)}, ` +
          `but got ${JSON.stringify(actual)}`
        );
      }
    },
    toMatch: (predicate) => {
      const state = store.getState();
      if (!predicate(state)) {
        throw new Error(
          `State did not match predicate: ${JSON.stringify(state)}`
        );
      }
    },
  };
}

/**
 * Options for test store creation.
 */
export interface TestStoreOptions<TState> {
  /** Initial state */
  initialState: TState;
  /** Whether to enable spy automatically */
  spy?: boolean;
}

/**
 * Test store wrapper with built-in utilities.
 */
export interface TestStore<TState> {
  /** The underlying store */
  store: Store<TState>;
  /** State spy (if enabled) */
  spy?: StoreSpy<TState>;
  /** State assertions */
  assert: StateAssertion<TState>;
  /** Reset store to initial state */
  reset: () => void;
  /** Destroy store and cleanup */
  destroy: () => void;
}

/**
 * Create a test store with built-in utilities.
 *
 * @param options - Test store options
 * @returns A test store wrapper
 *
 * @example
 * ```typescript
 * import { createTestStore } from '@oxog/state';
 *
 * describe('Counter', () => {
 *   let testStore: TestStore<{ count: number }>;
 *
 *   beforeEach(() => {
 *     testStore = createTestStore({ initialState: { count: 0 }, spy: true });
 *   });
 *
 *   afterEach(() => {
 *     testStore.destroy();
 *   });
 *
 *   it('should increment count', () => {
 *     testStore.store.setState({ count: 1 });
 *     testStore.assert.toEqual({ count: 1 });
 *     expect(testStore.spy?.changes).toHaveLength(1);
 *   });
 * });
 * ```
 */
export function createTestStore<TState>(
  options: TestStoreOptions<TState>
): TestStore<TState> {
  const { initialState, spy: enableSpy = true } = options;

  const store = createStore(initialState);
  const spy = enableSpy ? spyOnStore(store) : undefined;
  const assert = assertState(store);

  return {
    store,
    spy,
    assert,
    reset: () => {
      store.reset();
      spy?.reset();
    },
    destroy: () => {
      spy?.unsubscribe();
      store.destroy();
    },
  };
}

/**
 * Wait for a specified amount of time.
 *
 * @param ms - Milliseconds to wait
 * @returns A promise that resolves after the delay
 *
 * @example
 * ```typescript
 * await delay(100);
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a function and wait for all pending microtasks.
 *
 * @param fn - Function to run
 * @returns A promise that resolves after microtasks complete
 *
 * @example
 * ```typescript
 * await flushMicrotasks(() => {
 *   store.setState({ count: 1 });
 * });
 * ```
 */
export async function flushMicrotasks(fn?: () => void): Promise<void> {
  if (fn) {
    fn();
  }
  await Promise.resolve();
}

/**
 * Wrap a store action for testing with call tracking.
 */
export interface MockedAction<TArgs extends any[], TReturn> {
  /** Call the action */
  (...args: TArgs): TReturn;
  /** Number of times called */
  callCount: number;
  /** Arguments from each call */
  calls: TArgs[];
  /** Reset call tracking */
  reset: () => void;
}

/**
 * Create a mocked action for testing.
 *
 * @param fn - The original function
 * @returns A mocked action with call tracking
 *
 * @example
 * ```typescript
 * const mockIncrement = mockAction((amount: number) => {
 *   store.setState(s => ({ count: s.count + amount }));
 * });
 *
 * mockIncrement(5);
 * mockIncrement(3);
 *
 * expect(mockIncrement.callCount).toBe(2);
 * expect(mockIncrement.calls).toEqual([[5], [3]]);
 * ```
 */
export function mockAction<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn
): MockedAction<TArgs, TReturn> {
  const calls: TArgs[] = [];

  const mocked = ((...args: TArgs): TReturn => {
    calls.push(args);
    return fn(...args);
  }) as MockedAction<TArgs, TReturn>;

  Object.defineProperty(mocked, 'callCount', {
    get: () => calls.length,
  });

  mocked.calls = calls;
  mocked.reset = () => {
    calls.length = 0;
  };

  return mocked;
}

/**
 * Create a snapshot of the current store state.
 *
 * @param store - The store to snapshot
 * @returns A deep clone of the current state
 *
 * @example
 * ```typescript
 * const before = snapshot(store);
 * store.setState({ count: 5 });
 * const after = snapshot(store);
 *
 * expect(before.count).toBe(0);
 * expect(after.count).toBe(5);
 * ```
 */
export function snapshot<TState>(store: Store<TState>): TState {
  return JSON.parse(JSON.stringify(store.getState()));
}

/**
 * Compare two state snapshots and return differences.
 *
 * @param before - State before changes
 * @param after - State after changes
 * @returns Object containing changed keys and their values
 *
 * @example
 * ```typescript
 * const before = { count: 0, name: 'test' };
 * const after = { count: 5, name: 'test' };
 *
 * const diff = stateDiff(before, after);
 * // { count: { before: 0, after: 5 } }
 * ```
 */
export function stateDiff<TState extends Record<string, any>>(
  before: TState,
  after: TState
): Record<string, { before: any; after: any }> {
  const diff: Record<string, { before: any; after: any }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    if (!shallowEqual(before[key], after[key])) {
      diff[key] = { before: before[key], after: after[key] };
    }
  }

  return diff;
}
