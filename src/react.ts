import { useSyncExternalStore, useDebugValue, useEffect, useRef, useCallback } from 'react';
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

/**
 * Create a shallow equality wrapper for selectors.
 *
 * Use this hook to wrap selectors that return objects or arrays
 * and you want to avoid re-renders when the content hasn't changed.
 *
 * @param selector - The selector function to wrap
 * @returns A wrapped selector with shallow equality
 *
 * @example
 * ```typescript
 * import { useStore, useShallow } from '@oxog/state';
 *
 * function UserInfo() {
 *   // Without useShallow - re-renders on every state change
 *   const { name, email } = useStore(store, s => ({ name: s.name, email: s.email }));
 *
 *   // With useShallow - only re-renders when name or email actually changes
 *   const { name, email } = useStore(
 *     store,
 *     useShallow(s => ({ name: s.name, email: s.email }))
 *   );
 * }
 * ```
 */
export function useShallow<TState, TSelected extends object>(
  selector: Selector<TState, TSelected>
): Selector<TState, TSelected> {
  const prev = useRef<TSelected>();

  return (state: TState): TSelected => {
    const next = selector(state);

    if (prev.current === undefined) {
      prev.current = next;
      return next;
    }

    // Shallow compare
    if (shallowCompareObjects(prev.current, next)) {
      return prev.current;
    }

    prev.current = next;
    return next;
  };
}

/**
 * Shallow compare two objects.
 */
function shallowCompareObjects<T extends object>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if ((a as any)[key] !== (b as any)[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Hook for selecting multiple actions from a store.
 *
 * Returns stable references to actions that don't change between renders.
 *
 * @param store - The store instance
 * @param actionNames - Names of actions to select
 * @returns An object with the selected actions
 *
 * @example
 * ```typescript
 * import { useStoreActions } from '@oxog/state';
 *
 * function Counter() {
 *   const { increment, decrement, reset } = useStoreActions(
 *     store,
 *     'increment',
 *     'decrement',
 *     'reset'
 *   );
 *
 *   return (
 *     <>
 *       <button onClick={decrement}>-</button>
 *       <button onClick={increment}>+</button>
 *       <button onClick={reset}>Reset</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useStoreActions<
  TState,
  TKeys extends string[]
>(
  store: Store<TState>,
  ...actionNames: TKeys
): { [K in TKeys[number]]: (...args: any[]) => any } {
  const storeRef = useRef(store);
  const actionsRef = useRef<Record<string, Function>>({});

  // Update store ref if it changes
  if (storeRef.current !== store) {
    storeRef.current = store;
    // Reset actions cache when store changes
    actionsRef.current = {};
  }

  // Get or cache actions
  const result: any = {};
  for (const name of actionNames) {
    if (!actionsRef.current[name]) {
      actionsRef.current[name] = (storeRef.current as any)[name];
    }
    result[name] = actionsRef.current[name];
  }

  return result;
}

/**
 * Hook for selecting multiple values with independent selectors.
 *
 * Each selector is tracked independently, so the component only
 * re-renders when a selector's output actually changes.
 *
 * @param store - The store instance
 * @param selectors - Object of named selectors
 * @returns An object with selected values
 *
 * @example
 * ```typescript
 * import { useStoreSelector } from '@oxog/state';
 *
 * function Dashboard() {
 *   const { userCount, activeUsers, totalRevenue } = useStoreSelector(store, {
 *     userCount: s => s.users.length,
 *     activeUsers: s => s.users.filter(u => u.active).length,
 *     totalRevenue: s => s.orders.reduce((sum, o) => sum + o.total, 0),
 *   });
 *
 *   return (
 *     <div>
 *       <p>Users: {userCount} ({activeUsers} active)</p>
 *       <p>Revenue: ${totalRevenue}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStoreSelector<
  TState,
  TSelectors extends Record<string, Selector<TState, any>>
>(
  store: Store<TState>,
  selectors: TSelectors
): { [K in keyof TSelectors]: ReturnType<TSelectors[K]> } {
  const selectorsRef = useRef(selectors);
  const keysRef = useRef<string[]>(Object.keys(selectors));
  const prevResultRef = useRef<any>(null);

  // Update selectors ref
  if (selectorsRef.current !== selectors) {
    selectorsRef.current = selectors;
    keysRef.current = Object.keys(selectors);
  }

  // Memoized combined selector that returns stable reference when values unchanged
  const combinedSelector = useCallback((state: TState) => {
    const keys = keysRef.current;
    const currentSelectors = selectorsRef.current;
    const result: any = {};

    for (const key of keys) {
      const selector = currentSelectors[key];
      if (selector) {
        result[key] = selector(state);
      }
    }

    // Check if result is equal to previous (shallow compare each key)
    if (prevResultRef.current !== null) {
      let isEqual = true;
      for (const key of keys) {
        if (!shallowEqual(prevResultRef.current[key], result[key])) {
          isEqual = false;
          break;
        }
      }
      if (isEqual) {
        return prevResultRef.current;
      }
    }

    prevResultRef.current = result;
    return result;
  }, []);

  return useStore(store, combinedSelector);
}

/**
 * Hook for transient updates - subscribe without causing re-renders.
 *
 * Use this for side effects that don't need to update the UI.
 *
 * @param store - The store instance
 * @param selector - Selector function
 * @param callback - Callback to run on changes
 *
 * @example
 * ```typescript
 * import { useTransientSubscribe } from '@oxog/state';
 *
 * function Analytics() {
 *   // Track page views without re-rendering
 *   useTransientSubscribe(
 *     store,
 *     s => s.currentPage,
 *     (page) => analytics.track('pageview', { page })
 *   );
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useTransientSubscribe<TState, TSelected>(
  store: Store<TState>,
  selector: Selector<TState, TSelected>,
  callback: (value: TSelected, prevValue: TSelected) => void,
  equalityFn: EqualityFn<TSelected> = shallowEqual
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = store.subscribe(
      selector,
      (value, prevValue) => callbackRef.current(value, prevValue),
      equalityFn
    );

    return unsubscribe;
  }, [store, selector, equalityFn]);
}

/**
 * Hook that returns the store's setState function with stable reference.
 *
 * @param store - The store instance
 * @returns The setState function
 *
 * @example
 * ```typescript
 * function Form() {
 *   const setState = useSetState(store);
 *
 *   const handleChange = (e) => {
 *     setState({ [e.target.name]: e.target.value });
 *   };
 *
 *   return <input onChange={handleChange} />;
 * }
 * ```
 */
export function useSetState<TState>(
  store: Store<TState>
): (partial: Partial<TState> | ((state: TState) => Partial<TState>)) => void {
  const storeRef = useRef(store);
  if (storeRef.current !== store) {
    storeRef.current = store;
  }

  const setStateRef = useRef((partial: Partial<TState> | ((state: TState) => Partial<TState>)) => {
    storeRef.current.setState(partial);
  });

  return setStateRef.current;
}
