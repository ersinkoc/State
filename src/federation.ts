/**
 * Store Federation - Multi-store coordination and communication.
 *
 * Enables coordinated updates across multiple stores with
 * atomic transactions and unified state access.
 *
 * @module federation
 */

import type { Store } from './types.js';

/**
 * Extract state type from a Store.
 */
export type StoreState<S> = S extends Store<infer T> ? T : never;

/**
 * Map of store names to their state types.
 */
export type FederatedState<Stores extends Record<string, Store<any>>> = {
  [K in keyof Stores]: StoreState<Stores[K]>;
};

/**
 * Federation listener callback.
 */
export type FederationListener<Stores extends Record<string, Store<any>>> = (
  state: FederatedState<Stores>,
  prevState: FederatedState<Stores>,
  changedStore: keyof Stores
) => void;

/**
 * Federation transaction function.
 */
export type TransactionFn<Stores extends Record<string, Store<any>>> = (
  stores: Stores
) => void | Promise<void>;

/**
 * Federation options.
 */
export interface FederationOptions {
  /** Name for debugging */
  name?: string;
  /** Enable transaction logging */
  debug?: boolean;
}

/**
 * Federation interface for coordinating multiple stores.
 */
export interface Federation<Stores extends Record<string, Store<any>>> {
  /** Access to individual stores */
  readonly stores: Stores;

  /** Get combined state from all stores */
  getState(): FederatedState<Stores>;

  /** Subscribe to any store change */
  subscribe(listener: FederationListener<Stores>): () => void;

  /** Atomic multi-store update (synchronous) */
  transaction(fn: TransactionFn<Stores>): void;

  /** Async transaction with rollback on error */
  transactionAsync(fn: TransactionFn<Stores>): Promise<void>;

  /** Get a specific store */
  getStore<K extends keyof Stores>(name: K): Stores[K];

  /** Destroy federation and unsubscribe from all stores */
  destroy(): void;
}

/**
 * Create a federation of multiple stores.
 *
 * @param stores - Object containing named stores
 * @param options - Federation options
 * @returns A federation instance
 *
 * @example
 * ```typescript
 * import { createStore, createFederation } from '@oxog/state';
 *
 * // Create individual stores
 * const userStore = createStore({
 *   user: null,
 *   setUser: (state, user) => ({ user }),
 * });
 *
 * const cartStore = createStore({
 *   items: [],
 *   addItem: (state, item) => ({ items: [...state.items, item] }),
 *   clear: () => ({ items: [] }),
 * });
 *
 * const settingsStore = createStore({
 *   theme: 'light',
 *   setTheme: (state, theme) => ({ theme }),
 * });
 *
 * // Create federation
 * const federation = createFederation({
 *   user: userStore,
 *   cart: cartStore,
 *   settings: settingsStore,
 * });
 *
 * // Get combined state
 * const state = federation.getState();
 * // { user: { user: null, ... }, cart: { items: [], ... }, settings: { theme: 'light', ... } }
 *
 * // Subscribe to any store change
 * federation.subscribe((state, prevState, changedStore) => {
 *   console.log(`${changedStore} changed:`, state[changedStore]);
 * });
 *
 * // Atomic cross-store transaction
 * federation.transaction(({ user, cart }) => {
 *   cart.setState({ items: [] });
 *   user.setState({ user: null });
 * });
 * ```
 */
export function createFederation<Stores extends Record<string, Store<any>>>(
  stores: Stores,
  options: FederationOptions = {}
): Federation<Stores> {
  const { name = 'federation', debug = false } = options;

  const listeners = new Set<FederationListener<Stores>>();
  const unsubscribers: (() => void)[] = [];
  let isInTransaction = false;
  let transactionChanges: (keyof Stores)[] = [];
  let previousStates: FederatedState<Stores> | null = null;

  // Get combined state
  const getState = (): FederatedState<Stores> => {
    const state = {} as FederatedState<Stores>;
    for (const key in stores) {
      const store = stores[key];
      if (store) {
        state[key] = store.getState();
      }
    }
    return state;
  };

  // Notify listeners
  const notify = (changedStore: keyof Stores) => {
    if (isInTransaction) {
      if (!transactionChanges.includes(changedStore)) {
        transactionChanges.push(changedStore);
      }
      return;
    }

    const state = getState();
    const prevState = previousStates || state;

    for (const listener of listeners) {
      try {
        listener(state, prevState, changedStore);
      } catch (error) {
        console.error(`Federation listener error:`, error);
      }
    }

    previousStates = state;
  };

  // Subscribe to all stores
  for (const key in stores) {
    const store = stores[key];
    if (store) {
      const unsubscribe = store.subscribe(() => {
        notify(key);
      });
      unsubscribers.push(unsubscribe);
    }
  }

  // Initialize previous states
  previousStates = getState();

  // Log helper
  const log = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[${name}] ${message}`, ...args);
    }
  };

  return {
    stores,

    getState,

    subscribe(listener: FederationListener<Stores>) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    transaction(fn: TransactionFn<Stores>) {
      if (isInTransaction) {
        // Nested transaction - just execute
        fn(stores);
        return;
      }

      isInTransaction = true;
      transactionChanges = [];
      const snapshotStates = getState();

      log('Transaction started');

      try {
        const result = fn(stores);

        // Check if async (should use transactionAsync)
        if (result instanceof Promise) {
          throw new Error(
            'Async operations in transaction() are not supported. Use transactionAsync() instead.'
          );
        }

        isInTransaction = false;

        // Notify for all changed stores
        if (transactionChanges.length > 0) {
          log('Transaction committed, changed stores:', transactionChanges);
          const state = getState();

          for (const listener of listeners) {
            try {
              // Notify once with the first changed store
              listener(state, snapshotStates, transactionChanges[0]!);
            } catch (error) {
              console.error(`Federation listener error:`, error);
            }
          }

          previousStates = state;
        }
      } catch (error) {
        isInTransaction = false;

        // Rollback all stores to snapshot
        log('Transaction failed, rolling back');
        for (const key in stores) {
          const store = stores[key];
          if (store) {
            store.setState(snapshotStates[key] as any);
          }
        }

        throw error;
      }
    },

    async transactionAsync(fn: TransactionFn<Stores>) {
      if (isInTransaction) {
        // Nested transaction
        await fn(stores);
        return;
      }

      isInTransaction = true;
      transactionChanges = [];
      const snapshotStates = getState();

      log('Async transaction started');

      try {
        await fn(stores);

        isInTransaction = false;

        // Notify for all changed stores
        if (transactionChanges.length > 0) {
          log('Async transaction committed, changed stores:', transactionChanges);
          const state = getState();

          for (const listener of listeners) {
            try {
              listener(state, snapshotStates, transactionChanges[0]!);
            } catch (error) {
              console.error(`Federation listener error:`, error);
            }
          }

          previousStates = state;
        }
      } catch (error) {
        isInTransaction = false;

        // Rollback all stores to snapshot
        log('Async transaction failed, rolling back');
        for (const key in stores) {
          const store = stores[key];
          if (store) {
            store.setState(snapshotStates[key] as any);
          }
        }

        throw error;
      }
    },

    getStore<K extends keyof Stores>(storeName: K): Stores[K] {
      return stores[storeName];
    },

    destroy() {
      log('Destroying federation');
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      listeners.clear();
    },
  };
}

/**
 * Create a selector that combines state from multiple stores.
 *
 * @param federation - The federation instance
 * @param selector - Selector function
 * @returns A function that returns the selected value
 *
 * @example
 * ```typescript
 * const getCartTotal = createFederatedSelector(
 *   federation,
 *   (state) => {
 *     const items = state.cart.items;
 *     const discount = state.user.user?.discount || 0;
 *     const total = items.reduce((sum, item) => sum + item.price, 0);
 *     return total * (1 - discount);
 *   }
 * );
 *
 * const total = getCartTotal();
 * ```
 */
export function createFederatedSelector<
  Stores extends Record<string, Store<any>>,
  R
>(
  federation: Federation<Stores>,
  selector: (state: FederatedState<Stores>) => R
): () => R {
  return () => selector(federation.getState());
}

/**
 * Create a computed value from federated state.
 *
 * @param federation - The federation instance
 * @param selector - Selector function
 * @param equalityFn - Optional equality function for caching
 * @returns Object with get() and subscribe() methods
 *
 * @example
 * ```typescript
 * const isLoggedIn = createFederatedComputed(
 *   federation,
 *   (state) => state.user.user !== null
 * );
 *
 * // Get current value
 * if (isLoggedIn.get()) {
 *   showDashboard();
 * }
 *
 * // Subscribe to changes
 * isLoggedIn.subscribe((value) => {
 *   console.log('Login status:', value);
 * });
 * ```
 */
export function createFederatedComputed<
  Stores extends Record<string, Store<any>>,
  R
>(
  federation: Federation<Stores>,
  selector: (state: FederatedState<Stores>) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is
): {
  get(): R;
  subscribe(listener: (value: R, prevValue: R) => void): () => void;
} {
  let cachedValue = selector(federation.getState());
  const listeners = new Set<(value: R, prevValue: R) => void>();

  federation.subscribe((state) => {
    const newValue = selector(state);
    if (!equalityFn(newValue, cachedValue)) {
      const prevValue = cachedValue;
      cachedValue = newValue;
      for (const listener of listeners) {
        listener(newValue, prevValue);
      }
    }
  });

  return {
    get() {
      return cachedValue;
    },
    subscribe(listener: (value: R, prevValue: R) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Wait for a condition across federated stores.
 *
 * @param federation - The federation instance
 * @param predicate - Condition to wait for
 * @param timeout - Optional timeout in ms
 * @returns Promise that resolves when condition is met
 *
 * @example
 * ```typescript
 * // Wait for user to be logged in and cart to have items
 * await waitForFederated(
 *   federation,
 *   (state) => state.user.user !== null && state.cart.items.length > 0,
 *   5000 // 5 second timeout
 * );
 *
 * // Now proceed with checkout
 * checkout();
 * ```
 */
export function waitForFederated<Stores extends Record<string, Store<any>>>(
  federation: Federation<Stores>,
  predicate: (state: FederatedState<Stores>) => boolean,
  timeout?: number
): Promise<FederatedState<Stores>> {
  return new Promise((resolve, reject) => {
    // Check if already satisfied
    const state = federation.getState();
    if (predicate(state)) {
      resolve(state);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (unsubscribe) unsubscribe();
    };

    if (timeout) {
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`waitForFederated timed out after ${timeout}ms`));
      }, timeout);
    }

    unsubscribe = federation.subscribe((state) => {
      if (predicate(state)) {
        cleanup();
        resolve(state);
      }
    });
  });
}
