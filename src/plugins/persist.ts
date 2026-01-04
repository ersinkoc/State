/**
 * Persist plugin - Save and restore state from storage.
 *
 * Automatically persists state to localStorage, sessionStorage, or any
 * storage implementation. State is restored on store creation.
 *
 * @example
 * ```typescript
 * import { createStore, persist } from '@oxog/state';
 *
 * const store = createStore({ count: 0, user: null })
 *   .use(persist({
 *     key: 'my-app',
 *     storage: localStorage,
 *     whitelist: ['count'] // Only persist count
 *   }));
 * ```
 */

// Global type declarations
interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear?: () => void;
  length?: number;
  key?: (index: number) => string | null;
}

declare const window: {
  localStorage: Storage;
  sessionStorage: Storage;
} | undefined;

import type { Plugin, Store } from '../types.js';
import type { PersistOptions, StorageLike } from './types.js';
import { pick, omit } from '../utils/index.js';

/**
 * Default localStorage implementation.
 */
const defaultStorage: StorageLike = {
  getItem: (key: string): string | null => {
    /* c8 ignore next */
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    /* c8 ignore next */
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors
    }
  },
  /* c8 ignore next 3 */
  removeItem: (): void => {
    // No-op: removeItem is not used by persist plugin
  },
};

/**
 * SessionStorage implementation.
 */
export const sessionStorage: StorageLike = {
  getItem: (key: string): string | null => {
    /* c8 ignore next */
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    /* c8 ignore next */
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (key: string): void => {
    /* c8 ignore next */
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

/**
 * Create a persist plugin.
 *
 * @param options - Plugin options
 * @returns A persist plugin
 *
 * @example
 * ```typescript
 * import { persist, sessionStorage } from '@oxog/state';
 *
 * // Using localStorage (default)
 * const store = createStore({ count: 0 })
 *   .use(persist({ key: 'counter' }));
 *
 * // Using sessionStorage
 * const store = createStore({ count: 0 })
 *   .use(persist({ key: 'counter', storage: sessionStorage }));
 *
 * // With whitelist
 * const store = createStore({ count: 0, temp: '' })
 *   .use(persist({ key: 'app', whitelist: ['count'] }));
 *
 * // With blacklist
 * const store = createStore({ count: 0, temp: '' })
 *   .use(persist({ key: 'app', blacklist: ['temp'] }));
 * ```
 */
export function persist<TState>(options: PersistOptions<TState>): Plugin<TState> {
  const { key, storage = defaultStorage, whitelist, blacklist } = options;

  return {
    name: 'persist',
    version: '1.0.0',
    install(store: Store<TState>) {
      // Hydrate state from storage
      try {
        const saved = storage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          store.merge(parsed as any);
        }
      } catch (error) {
        console.error(`Failed to hydrate state from '${key}':`, error);
      }

      // Subscribe to state changes and persist
      store.subscribe((state) => {
        try {
          let toSave = state;

          if (whitelist) {
            toSave = pick(state as any, whitelist) as any;
          } else if (blacklist) {
            toSave = omit(state as any, blacklist) as any;
          }

          storage.setItem(key, JSON.stringify(toSave));
        } catch (error) {
          console.error(`Failed to persist state to '${key}':`, error);
        }
      });
    },
    onDestroy() {
      // Optionally clear storage on destroy
      // storage.removeItem(key);
    },
  };
}

/**
 * Create a custom storage from a storage object.
 *
 * @param storage - Any object with getItem, setItem, removeItem
 * @returns A StorageLike interface
 *
 * @example
 * ```typescript
 * import { createStorage } from '@oxog/state';
 *
 * const AsyncStorage = createStorage({
 *   getItem: async (key) => await AsyncStorage.getItem(key),
 *   setItem: async (key, value) => await AsyncStorage.setItem(key, value),
 *   removeItem: async (key) => await AsyncStorage.removeItem(key),
 * });
 * ```
 */
export function createStorage(storage: StorageLike): StorageLike {
  return storage;
}
