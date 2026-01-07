/**
 * Middleware Compatibility Layer
 *
 * Provides a generic middleware pattern for state management,
 * enabling compatibility with various middleware ecosystems.
 *
 * @module compat/middleware
 */

import type { Plugin, Store } from '../types.js';

/**
 * Middleware-style SetState function.
 */
export type MiddlewareSetState<T> = {
  (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean): void;
};

/**
 * Middleware-style GetState function.
 */
export type MiddlewareGetState<T> = () => T;

/**
 * Middleware-style Subscribe function.
 */
export type MiddlewareSubscribe<T> = (listener: (state: T, prevState: T) => void) => () => void;

/**
 * Generic StoreApi for middleware compatibility.
 */
export interface MiddlewareStoreApi<T> {
  setState: MiddlewareSetState<T>;
  getState: MiddlewareGetState<T>;
  subscribe: MiddlewareSubscribe<T>;
  destroy?: () => void;
}

/**
 * State creator function for middleware pattern.
 */
export type StateCreatorFn<T, Mps extends unknown[] = [], Mcs extends unknown[] = []> = (
  set: MiddlewareSetState<T>,
  get: MiddlewareGetState<T>,
  api: MiddlewareStoreApi<T>
) => T;

/**
 * Generic Middleware type.
 */
export type MiddlewareFn<
  T,
  Mps extends unknown[] = [],
  Mcs extends unknown[] = []
> = (
  creator: StateCreatorFn<T, Mps, Mcs>
) => StateCreatorFn<T, Mps, Mcs>;

/**
 * Convert an @oxog/state store to middleware-compatible API.
 *
 * @param store - An @oxog/state store
 * @returns A middleware-compatible store API
 *
 * @example
 * ```typescript
 * import { createStore, toMiddlewareApi } from '@oxog/state';
 *
 * const store = createStore({ count: 0 });
 * const api = toMiddlewareApi(store);
 *
 * // Use middleware-style API
 * api.setState({ count: 1 });
 * api.setState((state) => ({ count: state.count + 1 }));
 * console.log(api.getState()); // { count: 2 }
 * ```
 */
export function toMiddlewareApi<T>(store: Store<T>): MiddlewareStoreApi<T> {
  return {
    setState: (partial, replace) => {
      if (typeof partial === 'function') {
        const currentState = store.getState();
        const newPartial = partial(currentState);
        if (replace) {
          store.setState(newPartial as any);
        } else {
          store.merge(newPartial as any);
        }
      } else {
        if (replace) {
          store.setState(partial as any);
        } else {
          store.merge(partial as any);
        }
      }
    },
    getState: () => store.getState(),
    subscribe: (listener) => store.subscribe(listener),
    destroy: () => store.destroy(),
  };
}

/**
 * Wrap a middleware to work as an @oxog/state plugin.
 *
 * @param middleware - A middleware function
 * @param options - Optional middleware options
 * @returns An @oxog/state plugin
 *
 * @example
 * ```typescript
 * import { createStore, middlewareCompat } from '@oxog/state';
 *
 * // Use external middleware with @oxog/state
 * const store = createStore({ count: 0 })
 *   .use(middlewareCompat(someMiddleware, { name: 'MyStore' }));
 * ```
 */
export function middlewareCompat<T>(
  middleware: MiddlewareFn<T>,
  options?: Record<string, unknown>
): Plugin<T> {
  return {
    name: 'middleware-compat',
    version: '1.0.0',

    install(store: Store<T>) {
      // Create middleware-compatible API
      const api = toMiddlewareApi(store);

      // Create a state creator that returns current state
      const stateCreator: StateCreatorFn<T> = (set, get) => {
        // Return current state - middleware can modify it
        return get();
      };

      // Apply the middleware
      const enhancedCreator = middleware(stateCreator);

      // Create enhanced API with middleware's modifications
      const enhancedState = enhancedCreator(api.setState, api.getState, api);

      // If middleware returned new state/methods, merge them
      if (enhancedState && typeof enhancedState === 'object') {
        const currentState = store.getState();
        const stateOnly: Partial<T> = {};

        // Extract only state values (not functions)
        for (const key in enhancedState) {
          const value = enhancedState[key];
          if (typeof value !== 'function') {
            stateOnly[key as keyof T] = value;
          }
        }

        // Merge new state if different
        if (Object.keys(stateOnly).length > 0) {
          const hasChanges = Object.keys(stateOnly).some(
            (key) => currentState[key as keyof T] !== stateOnly[key as keyof T]
          );
          if (hasChanges) {
            store.merge(stateOnly as any);
          }
        }
      }
    },
  };
}

/**
 * Create a store using middleware-style state creator.
 *
 * @param creator - Middleware-style state creator function
 * @returns A store API
 *
 * @example
 * ```typescript
 * import { createWithMiddleware } from '@oxog/state';
 *
 * const store = createWithMiddleware((set, get) => ({
 *   count: 0,
 *   increment: () => set((state) => ({ count: state.count + 1 })),
 *   decrement: () => set((state) => ({ count: state.count - 1 })),
 *   reset: () => set({ count: 0 }),
 *   getDoubled: () => get().count * 2,
 * }));
 *
 * store.getState().increment();
 * console.log(store.getState().count); // 1
 * ```
 */
export function createWithMiddleware<T extends object>(
  creator: StateCreatorFn<T>
): MiddlewareStoreApi<T> & { use: <U>(plugin: Plugin<T>) => MiddlewareStoreApi<T> } {
  // Import createStore dynamically to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createStore } = require('../store.js');

  // Create temporary state holder
  let currentState: T | null = null;
  let storeRef: Store<T> | null = null;

  // Create middleware-style set/get
  const set: MiddlewareSetState<T> = (partial, replace) => {
    if (!storeRef) {
      throw new Error('Store not initialized');
    }

    if (typeof partial === 'function') {
      const newPartial = partial(storeRef.getState());
      if (replace) {
        storeRef.setState(newPartial as any);
      } else {
        storeRef.merge(newPartial as any);
      }
    } else {
      if (replace) {
        storeRef.setState(partial as any);
      } else {
        storeRef.merge(partial as any);
      }
    }
  };

  const get: MiddlewareGetState<T> = () => {
    if (storeRef) {
      return storeRef.getState();
    }
    if (currentState) {
      return currentState;
    }
    throw new Error('Store not initialized');
  };

  // Create placeholder API for initialization
  const placeholderApi: MiddlewareStoreApi<T> = {
    setState: set,
    getState: get,
    subscribe: () => () => {},
  };

  // Run creator to get initial state
  currentState = creator(set, get, placeholderApi);

  // Create actual store
  storeRef = createStore(currentState);

  // Create full API
  const api: MiddlewareStoreApi<T> & { use: <U>(plugin: Plugin<T>) => MiddlewareStoreApi<T> } = {
    setState: (partial, replace) => {
      if (typeof partial === 'function') {
        const newPartial = partial(storeRef!.getState());
        if (replace) {
          storeRef!.setState(newPartial as any);
        } else {
          storeRef!.merge(newPartial as any);
        }
      } else {
        if (replace) {
          storeRef!.setState(partial as any);
        } else {
          storeRef!.merge(partial as any);
        }
      }
    },
    getState: () => storeRef!.getState(),
    subscribe: (listener) => storeRef!.subscribe(listener),
    destroy: () => storeRef!.destroy(),
    use: (plugin) => {
      storeRef!.use(plugin);
      return api;
    },
  };

  return api;
}

/**
 * Create a simple middleware.
 *
 * @param name - Middleware name
 * @param enhancer - Function that enhances the state creator
 * @returns A middleware function
 *
 * @example
 * ```typescript
 * const loggerMiddleware = createSimpleMiddleware('logger', (creator) => (set, get, api) => {
 *   const loggedSet: typeof set = (partial, replace) => {
 *     console.log('Before:', get());
 *     set(partial, replace);
 *     console.log('After:', get());
 *   };
 *   return creator(loggedSet, get, api);
 * });
 *
 * const store = createStore({ count: 0 })
 *   .use(middlewareCompat(loggerMiddleware));
 * ```
 */
export function createSimpleMiddleware<T>(
  name: string,
  enhancer: (
    creator: StateCreatorFn<T>
  ) => StateCreatorFn<T>
): MiddlewareFn<T> {
  const middleware = enhancer as MiddlewareFn<T>;
  // Add name for debugging
  Object.defineProperty(middleware, 'name', { value: name });
  return middleware;
}

/**
 * Compose multiple middlewares.
 *
 * @param middlewares - Array of middlewares
 * @returns A single composed middleware
 *
 * @example
 * ```typescript
 * import { compose, middlewareCompat } from '@oxog/state';
 *
 * const composedMiddleware = compose(
 *   loggerMiddleware,
 *   devtoolsMiddleware,
 *   persistMiddleware,
 * );
 *
 * const store = createStore({ count: 0 })
 *   .use(middlewareCompat(composedMiddleware));
 * ```
 */
export function compose<T>(
  ...middlewares: MiddlewareFn<T>[]
): MiddlewareFn<T> {
  return (creator) => {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, creator);
  };
}

/**
 * Type helper for extracting state type from a store API.
 */
export type ExtractStateType<S> = S extends MiddlewareStoreApi<infer T> ? T : never;

/**
 * Type helper for selector function.
 */
export type SelectorFn<T, U> = (state: T) => U;

/**
 * Type helper for equality function.
 */
export type EqualityCheck<T> = (a: T, b: T) => boolean;

// Legacy aliases for backward compatibility (deprecated)
/** @deprecated Use MiddlewareSetState instead */
export type ZustandSetState<T> = MiddlewareSetState<T>;
/** @deprecated Use MiddlewareGetState instead */
export type ZustandGetState<T> = MiddlewareGetState<T>;
/** @deprecated Use MiddlewareSubscribe instead */
export type ZustandSubscribe<T> = MiddlewareSubscribe<T>;
/** @deprecated Use MiddlewareStoreApi instead */
export type ZustandStoreApi<T> = MiddlewareStoreApi<T>;
/** @deprecated Use StateCreatorFn instead */
export type ZustandStateCreator<T, Mps extends unknown[] = [], Mcs extends unknown[] = []> = StateCreatorFn<T, Mps, Mcs>;
/** @deprecated Use MiddlewareFn instead */
export type ZustandMiddleware<T, Mps extends unknown[] = [], Mcs extends unknown[] = []> = MiddlewareFn<T, Mps, Mcs>;
/** @deprecated Use toMiddlewareApi instead */
export const toZustandApi = toMiddlewareApi;
/** @deprecated Use middlewareCompat instead */
export const zustandCompat = middlewareCompat;
/** @deprecated Use createWithMiddleware instead */
export const createWithZustand = createWithMiddleware;
/** @deprecated Use createSimpleMiddleware instead */
export const createMiddleware = createSimpleMiddleware;
/** @deprecated Use compose instead */
export const composeMiddleware = compose;
/** @deprecated Use ExtractStateType instead */
export type ExtractState<S> = ExtractStateType<S>;
/** @deprecated Use SelectorFn instead */
export type ZustandSelector<T, U> = SelectorFn<T, U>;
/** @deprecated Use EqualityCheck instead */
export type ZustandEqualityFn<T> = EqualityCheck<T>;
