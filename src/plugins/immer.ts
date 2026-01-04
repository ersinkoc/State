/**
 * Immer plugin - Immutable updates with mutable syntax.
 *
 * Uses Proxy to enable writing immutable state updates with mutable syntax.
 *
 * @example
 * ```typescript
 * import { createStore, immer } from '@oxog/state';
 *
 * const store = createStore({
 *   users: [{ name: 'John', age: 30 }]
 * }).use(immer());
 *
 * // Now you can write mutable-style updates
 * store.setState((draft) => {
 *   draft.users[0].age = 31; // Mutate draft directly
 * });
 * ```
 */

import type { Plugin, Store } from '../types.js';

/**
 * Create a proxy that tracks mutations.
 *
 * @param base - The base object
 * @param copies - Map of copied objects
 * @returns A proxied object
 */
function createProxy<T extends object>(base: T, copies: Map<any, any>): T {
  /* c8 ignore next */
  return new Proxy(base || {}, {
    get(target, key) {
      const value = (target as any)[key];

      // If value is an object, return a proxy
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Check if we have a copy
        if (copies.has(value)) {
          return createProxy(copies.get(value), copies);
        }
        return createProxy(value, copies);
      }

      // Return primitive or array as-is
      return value;
    },

    set(target, key, value) {
      // Ensure we have a copy of the target
      if (!copies.has(target)) {
        copies.set(target, { ...target });
      }

      const copy = copies.get(target);
      copy[key] = value;
      return true;
    },

    deleteProperty(target, key) {
      if (!copies.has(target)) {
        copies.set(target, { ...target });
      }

      const copy = copies.get(target);
      delete copy[key];
      return true;
    },
  }) as T;
}

/**
 * Finalize the result by applying all copies.
 *
 * @param base - The base object
 * @param copies - Map of copied objects
 * @returns The final result (always a new object if base was in copies)
 */
function finalize<T>(base: T, copies: Map<any, any>): T {
  if (!copies.has(base)) {
    // No copies were made, but we still need to ensure we don't return the same reference
    // Deep clone to ensure immutability
    return deepClone(base);
  }

  const copy = copies.get(base) as any;

  // Recursively finalize nested objects
  for (const key in copy) {
    if (Object.prototype.hasOwnProperty.call(copy, key)) {
      const value = copy[key];
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        copy[key] = finalize(value, copies);
      }
    }
  }

  return copy as T;
}

/**
 * Deep clone a value (simplified version for immer plugin).
 */
function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((v) => deepClone(v)) as T;
  }

  const cloned = {} as T;
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      (cloned as any)[key] = deepClone((value as any)[key]);
    }
  }
  return cloned;
}

/**
 * Produce a new state by applying mutations to a draft.
 *
 * @param base - The base state
 * @param recipe - The mutation function
 * @returns The new state
 *
 * @example
 * ```typescript
 * import { produce } from '@oxog/state';
 *
 * const state = { users: [{ name: 'John', age: 30 }] };
 * const newState = produce(state, (draft) => {
 *   draft.users[0].age = 31;
 * });
 * ```
 */
export function produce<T>(base: T, recipe: (draft: T) => void): T {
  const copies = new Map<any, any>();
  const draft = createProxy(base as object, copies) as T;

  recipe(draft);

  return finalize(base as object, copies) as T;
}

/**
 * Create an immer plugin.
 *
 * @returns An immer plugin
 *
 * @example
 * ```typescript
 * import { createStore, immer } from '@oxog/state';
 *
 * const store = createStore({
 *   items: [{ id: 1, name: 'Item 1' }]
 * }).use(immer());
 *
 * // Now setState can accept a mutable recipe function
 * store.setState((draft) => {
 *   draft.items[0].name = 'Updated Item';
 *   draft.items.push({ id: 2, name: 'Item 2' });
 * });
 * ```
 */
export function immer<TState>(): Plugin<TState> {
  return {
    name: 'immer',
    version: '1.0.0',
    install(store: Store<TState>) {
      // Wrap setState to support recipe functions
      const originalSetState = store.setState.bind(store);

      store.setState = (update: any) => {
        if (typeof update === 'function') {
          // Assume this is a recipe function
          const newState = produce(store.getState(), update);
          originalSetState(newState as any);
        } else {
          originalSetState(update);
        }
      };
    },
  };
}
