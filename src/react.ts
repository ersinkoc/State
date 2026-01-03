import { useSyncExternalStore, useDebugValue, useEffect, useRef } from 'react';
import type { EqualityFn, Selector, Store } from './types.js';
import { identity } from './utils/identity.js';
import { shallowEqual } from './utils/shallow-equal.js';
import { createStore as _createStore } from './store.js';

// Global type declarations
declare const window: {
  __REDUX_DEVTOOLS_EXTENSION__?: any;
} | undefined;

/**
 * React hook for subscribing to store state changes.
 *
 * Uses useSyncExternalStore for optimal performance and SSR compatibility.
 *
 * @typeParam TState - The store state type
 * @typeParam TSelected - The selected state type
 * @param store - The store instance
 * @param selector - Optional selector to extract a slice of state
 * @param equalityFn - Optional custom equality function
 * @returns The selected state slice
 *
 * @example
 * ```typescript
 * import { createStore, useStore } from '@oxog/state';
 *
 * const store = createStore({
 *   count: 0,
 *   name: 'John',
 *   increment: (state) => ({ count: state.count + 1 }),
 * });
 *
 * function Counter() {
 *   // Select entire state
 *   const state = useStore(store);
 *
 *   // Select with selector
 *   const count = useStore(store, (state) => state.count);
 *
 *   // Select with custom equality check
 *   const user = useStore(
 *     store,
 *     (state) => state.user,
 *     (a, b) => a?.id === b?.id
 *   );
 *
 *   // Select action
 *   const increment = useStore(store, (state) => state.increment);
 *
 *   return (
 *     <button onClick={increment}>
 *       Count: {count}
 *     </button>
 *   );
 * }
 * ```
 */
export function useStore<TState, TSelected = TState>(
  store: Store<TState>,
  selector: Selector<TState, TSelected> = identity as any,
  equalityFn: EqualityFn<TSelected> = shallowEqual as any
): TSelected {
  // Get the latest selector
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);
  const storeRef = useRef(store);

  // Update refs if they change
  if (selectorRef.current !== selector) {
    selectorRef.current = selector;
  }
  if (equalityFnRef.current !== equalityFn) {
    equalityFnRef.current = equalityFn;
  }
  if (storeRef.current !== store) {
    storeRef.current = store;
  }

  // Get current snapshot
  const getSnapshot = () => {
    const state = storeRef.current.getState();
    return selectorRef.current(state);
  };

  // Get previous snapshot for comparison
  const getServerSnapshot = getSnapshot;

  // Subscribe to store changes
  const subscribe = (callback: () => void) => {
    const unsubscribe = storeRef.current.subscribe(
      (state) => selectorRef.current(state),
      (value, prevValue) => {
        if (!equalityFnRef.current(value, prevValue)) {
          callback();
        }
      },
      equalityFnRef.current
    );
    return unsubscribe;
  };

  // Use sync external store
  const selectedState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Debug value for React DevTools
  useDebugValue(selectedState);

  return selectedState;
}

/**
 * Check if the code is running on the server.
 *
 * @returns true if running on server
 *
 * @internal
 */
function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * React hook for creating and using a store.
 *
 * Creates a store on first render and destroys it on unmount.
 *
 * @typeParam TState - The store state type
 * @param initialState - The initial state
 * @returns The store instance
 *
 * @example
 * ```typescript
 * import { useCreateStore } from '@oxog/state';
 *
 * function Component() {
 *   const store = useCreateStore({ count: 0 });
 *   const count = useStore(store, (s) => s.count);
 *
 *   return <div>{count}</div>;
 * }
 * ```
 */
export function useCreateStore<TState>(initialState: TState): Store<TState> {
  const storeRef = useRef<Store<TState>>();

  if (storeRef.current === undefined) {
    storeRef.current = _createStore(initialState);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (storeRef.current) {
        storeRef.current.destroy();
        storeRef.current = undefined;
      }
    };
  }, []);

  return storeRef.current!;
}

/**
 * React hook for getting a store action.
 *
 * Convenience hook for selecting action functions from a store.
 *
 * @typeParam TState - The store state type
 * @typeParam TAction - The action type
 * @param store - The store instance
 * @param actionName - The name of the action
 * @returns The action function
 *
 * @example
 * ```typescript
 * import { createStore, useAction } from '@oxog/state';
 *
 * const store = createStore({
 *   count: 0,
 *   increment: (state) => ({ count: state.count + 1 }),
 *   decrement: (state) => ({ count: state.count - 1 }),
 * });
 *
 * function Counter() {
 *   const increment = useAction(store, 'increment');
 *   const decrement = useAction(store, 'decrement');
 *   const count = useStore(store, (s) => s.count);
 *
 *   return (
 *     <>
 *       <button onClick={decrement}>-</button>
 *       <span>{count}</span>
 *       <button onClick={increment}>+</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useAction<TState, TAction extends (...args: any[]) => any>(
  store: Store<TState>,
  actionName: string
): TAction {
  // Actions are methods on the store instance, not properties of state
  const storeRef = useRef(store);
  if (storeRef.current !== store) {
    storeRef.current = store;
  }

  // Get the action from the store instance
  const action = (storeRef.current as any)[actionName];

  // Return a stable reference to the action
  const actionRef = useRef(action);
  if (actionRef.current !== action) {
    actionRef.current = action;
  }

  return actionRef.current as TAction;
}
