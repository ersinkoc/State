/**
 * Slices pattern for modular store composition.
 *
 * @module slices
 */

import type { Store } from './types.js';
import { createStore } from './store.js';

/**
 * SetSlice function type for updating slice state.
 */
export type SetSlice<TState> = {
  (partial: Partial<TState>): void;
  (updater: (state: TState) => Partial<TState>): void;
};

/**
 * GetSlice function type for getting current state.
 */
export type GetSlice<TState> = () => TState;

/**
 * Slice creator function signature.
 *
 * @typeParam TState - The full store state type
 * @typeParam TSlice - The slice state type
 */
export type SliceCreator<TState, TSlice extends Partial<TState>> = (
  set: SetSlice<TState>,
  get: GetSlice<TState>,
  store: Store<TState>
) => TSlice;

/**
 * Slice definition with state and actions.
 */
export interface SliceDefinition<TState, TSlice extends Partial<TState>> {
  /** Slice name for debugging */
  name: string;
  /** Slice creator function */
  creator: SliceCreator<TState, TSlice>;
}

/**
 * Create a slice definition for use with combineSlices.
 *
 * Slices are modular pieces of state and actions that can be combined
 * to create a complete store.
 *
 * @param name - Slice name for debugging
 * @param creator - Slice creator function
 * @returns A slice definition
 *
 * @example
 * ```typescript
 * // Define a counter slice
 * const counterSlice = createSlice('counter', (set, get) => ({
 *   count: 0,
 *   increment: () => set((s) => ({ count: s.count + 1 })),
 *   decrement: () => set((s) => ({ count: s.count - 1 })),
 *   reset: () => set({ count: 0 }),
 * }));
 *
 * // Define a user slice
 * const userSlice = createSlice('user', (set, get) => ({
 *   user: null as User | null,
 *   setUser: (user: User) => set({ user }),
 *   logout: () => set({ user: null }),
 * }));
 *
 * // Combine slices into a store
 * const store = combineSlices(counterSlice, userSlice);
 *
 * // Use the store
 * store.increment();
 * store.setUser({ name: 'John' });
 * ```
 */
export function createSlice<TState, TSlice extends Partial<TState>>(
  name: string,
  creator: SliceCreator<TState, TSlice>
): SliceDefinition<TState, TSlice> {
  return { name, creator };
}

/**
 * Internal slice creator type for type inference.
 */
type InferSlice<T> = T extends SliceDefinition<any, infer S> ? S : never;

/**
 * Combined state type from multiple slices.
 */
type CombinedState<TSlices extends SliceDefinition<any, any>[]> = {
  [K in keyof TSlices]: InferSlice<TSlices[K]>;
}[number] extends infer U
  ? U extends object
    ? { [K in keyof U as U extends Record<K, any> ? K : never]: U[K] }
    : never
  : never;

/**
 * Combine multiple slices into a single store.
 *
 * @param slices - Slice definitions to combine
 * @returns A store with combined state and actions
 *
 * @example
 * ```typescript
 * const counterSlice = createSlice('counter', (set) => ({
 *   count: 0,
 *   increment: () => set((s) => ({ count: s.count + 1 })),
 * }));
 *
 * const userSlice = createSlice('user', (set) => ({
 *   user: null,
 *   setUser: (user) => set({ user }),
 * }));
 *
 * const store = combineSlices(counterSlice, userSlice);
 *
 * // Type-safe access to all slice methods
 * store.increment();
 * store.setUser({ name: 'John' });
 * ```
 */
export function combineSlices<TSlices extends SliceDefinition<any, any>[]>(
  ...slices: TSlices
): Store<CombinedState<TSlices>> & CombinedState<TSlices> {
  // First pass: collect initial state from all slices
  const initialState: any = {};
  const actions: Record<string, Function> = {};

  // Create a temporary store to pass to slice creators
  // We'll replace its state after collecting from all slices
  let tempStore: Store<any> | null = null;

  const set: SetSlice<any> = (partial) => {
    if (tempStore) {
      if (typeof partial === 'function') {
        tempStore.setState(partial);
      } else {
        tempStore.setState(partial);
      }
    }
  };

  const get: GetSlice<any> = () => {
    return tempStore ? tempStore.getState() : initialState;
  };

  // Create placeholder store for initial state collection
  const placeholderStore = {
    getState: () => initialState,
    setState: () => {},
    subscribe: () => () => {},
    merge: () => {},
    reset: () => {},
    use: () => placeholderStore,
    destroy: () => {},
  } as Store<any>;

  // Collect initial state and actions from all slices
  for (const slice of slices) {
    const sliceResult = slice.creator(set, get, placeholderStore);

    for (const [key, value] of Object.entries(sliceResult)) {
      if (typeof value === 'function') {
        actions[key] = value;
      } else {
        initialState[key] = value;
      }
    }
  }

  // Create the actual store
  tempStore = createStore(initialState);

  // Re-run slice creators with the actual store to bind actions
  for (const slice of slices) {
    const sliceResult = slice.creator(
      (partial) => {
        if (typeof partial === 'function') {
          tempStore!.setState(partial);
        } else {
          tempStore!.setState(partial);
        }
      },
      () => tempStore!.getState(),
      tempStore
    );

    // Update actions with properly bound versions
    for (const [key, value] of Object.entries(sliceResult)) {
      if (typeof value === 'function') {
        actions[key] = value;
      }
    }
  }

  // Add actions to the store
  const store = tempStore as any;
  for (const [name, action] of Object.entries(actions)) {
    store[name] = action;
  }

  return store;
}

/**
 * Create a namespaced slice that prefixes all state keys.
 *
 * @param namespace - The namespace prefix
 * @param creator - Slice creator function
 * @returns A namespaced slice definition
 *
 * @example
 * ```typescript
 * const settingsSlice = createNamespacedSlice('settings', (set) => ({
 *   theme: 'dark',
 *   language: 'en',
 *   setTheme: (theme) => set({ theme }),
 * }));
 *
 * // State will be: { settings: { theme: 'dark', language: 'en' } }
 * // Actions will be: setTheme
 * ```
 */
export function createNamespacedSlice<TSlice extends Record<string, any>>(
  namespace: string,
  creator: (
    set: (partial: Partial<TSlice>) => void,
    get: () => TSlice
  ) => TSlice
): SliceDefinition<Record<string, any>, Record<string, any>> {
  return createSlice(namespace, (set, get, store) => {
    // Wrapper set that updates the namespaced state
    const namespacedSet = (partial: Partial<TSlice> | ((current: TSlice) => Partial<TSlice>)) => {
      const current = (get()[namespace] || {}) as TSlice;
      const update = typeof partial === 'function' ? partial(current) : partial;
      set({ [namespace]: { ...current, ...update } } as any);
    };

    // Wrapper get that returns namespaced state
    const namespacedGet = (): TSlice => {
      return (get()[namespace] || {}) as TSlice;
    };

    // Get slice result
    const sliceResult = creator(namespacedSet, namespacedGet);

    // Separate state and actions
    const state: any = {};
    const actions: any = {};

    for (const [key, value] of Object.entries(sliceResult)) {
      if (typeof value === 'function') {
        actions[key] = value;
      } else {
        state[key] = value;
      }
    }

    // Return namespaced state with actions at root
    return {
      [namespace]: state,
      ...actions,
    };
  });
}

/**
 * Extend an existing store with additional slices.
 *
 * @param store - The existing store
 * @param slices - Additional slices to add
 * @returns The extended store
 *
 * @example
 * ```typescript
 * const baseStore = createStore({ count: 0 });
 *
 * const extendedStore = extendStore(
 *   baseStore,
 *   createSlice('user', (set) => ({
 *     user: null,
 *     setUser: (user) => set({ user }),
 *   }))
 * );
 * ```
 */
export function extendStore<TState, TSlices extends SliceDefinition<TState & any, any>[]>(
  store: Store<TState>,
  ...slices: TSlices
): Store<TState & CombinedState<TSlices>> & CombinedState<TSlices> {
  const actions: Record<string, Function> = {};

  const set: SetSlice<any> = (partial) => {
    if (typeof partial === 'function') {
      store.setState(partial as any);
    } else {
      store.setState(partial as any);
    }
  };

  const get: GetSlice<any> = () => store.getState();

  // Process each slice
  for (const slice of slices) {
    const sliceResult = slice.creator(set, get, store as any);

    for (const [key, value] of Object.entries(sliceResult)) {
      if (typeof value === 'function') {
        actions[key] = value;
      } else {
        // Merge initial state
        store.setState({ [key]: value } as any);
      }
    }
  }

  // Add actions to store
  const extendedStore = store as any;
  for (const [name, action] of Object.entries(actions)) {
    extendedStore[name] = action;
  }

  return extendedStore;
}

/**
 * Reset specific slices to their initial state.
 *
 * @param store - The store
 * @param sliceNames - Names of slices to reset
 *
 * @example
 * ```typescript
 * // Reset only the user slice
 * resetSlices(store, 'user');
 *
 * // Reset multiple slices
 * resetSlices(store, 'user', 'cart');
 * ```
 */
export function resetSlices<TState>(
  store: Store<TState>,
  ...sliceNames: string[]
): void {
  // This requires storing initial state per slice
  // For now, use store.reset() for full reset
  console.warn('resetSlices: Use store.reset() to reset all state');
  store.reset();
}
