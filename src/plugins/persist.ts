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
 * Create a debounced function for persist writes.
 */
function createDebounced<T extends (...args: any[]) => any>(
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
 * Storage wrapper with versioning.
 */
interface PersistedData<T> {
  state: T;
  version: number;
}

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
 * // With encryption
 * const store = createStore({ secret: 'data' })
 *   .use(persist({
 *     key: 'secure',
 *     encrypt: (data) => btoa(data),
 *     decrypt: (data) => atob(data),
 *   }));
 *
 * // With debounce and migration
 * const store = createStore({ count: 0 })
 *   .use(persist({
 *     key: 'app',
 *     writeDebounce: 1000,
 *     version: 2,
 *     migrate: (state, version) => {
 *       if (version < 2) return { ...state, newField: 'default' };
 *       return state;
 *     },
 *   }));
 * ```
 */
export function persist<TState>(options: PersistOptions<TState>): Plugin<TState> {
  const {
    key,
    storage = defaultStorage,
    whitelist,
    blacklist,
    partialize,
    merge: customMerge,
    version = 0,
    migrate,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    encrypt,
    decrypt,
    writeDebounce,
    onRehydrateStorage,
    onHydrationComplete,
    onPersistError,
  } = options;

  let cancelDebounce: (() => void) | null = null;

  return {
    name: 'persist',
    version: '1.0.0',
    install(store: Store<TState>) {
      // Hydrate state from storage
      try {
        let saved = storage.getItem(key);

        // Decrypt if needed
        if (saved && decrypt) {
          try {
            saved = decrypt(saved);
          } catch {
            // Decryption failed, treat as no saved data
            saved = null;
          }
        }

        if (saved) {
          let parsed: Partial<TState>;
          let persistedVersion = 0;

          // Try to parse with versioning
          try {
            const data = deserialize(saved) as PersistedData<Partial<TState>> | Partial<TState>;

            // Check if it's versioned data
            if (data && typeof data === 'object' && 'state' in data && 'version' in data) {
              parsed = (data as PersistedData<Partial<TState>>).state;
              persistedVersion = (data as PersistedData<Partial<TState>>).version;
            } else {
              parsed = data as Partial<TState>;
            }
          } catch {
            // Fallback to direct parse
            parsed = deserialize(saved);
          }

          // Call onRehydrateStorage
          if (onRehydrateStorage) {
            onRehydrateStorage(parsed as TState);
          }

          // Run migration if needed
          if (migrate && persistedVersion < version) {
            parsed = migrate(parsed, persistedVersion) as Partial<TState>;
          }

          // Merge with current state
          if (customMerge) {
            const currentState = store.getState();
            const mergedState = customMerge(parsed, currentState);
            store.setState(mergedState as any);
          } else {
            store.merge(parsed as any);
          }

          // Call onHydrationComplete
          if (onHydrationComplete) {
            onHydrationComplete(store.getState());
          }
        }
      } catch (error) {
        if (onPersistError) {
          onPersistError(error as Error);
        } else {
          console.error(`Failed to hydrate state from '${key}':`, error);
        }
      }

      // Persist function
      const persistState = (state: TState) => {
        try {
          let toSave: Partial<TState> = state;

          // Apply partialize first
          if (partialize) {
            toSave = partialize(state);
          } else if (whitelist) {
            toSave = pick(state as any, whitelist) as Partial<TState>;
          } else if (blacklist) {
            toSave = omit(state as any, blacklist) as unknown as Partial<TState>;
          }

          // Wrap with version
          const dataToStore: PersistedData<Partial<TState>> = {
            state: toSave,
            version,
          };

          // Serialize
          let serialized = serialize(dataToStore as any);

          // Encrypt if needed
          if (encrypt) {
            serialized = encrypt(serialized);
          }

          storage.setItem(key, serialized);
        } catch (error) {
          if (onPersistError) {
            onPersistError(error as Error);
          } else {
            console.error(`Failed to persist state to '${key}':`, error);
          }
        }
      };

      // Apply debounce if configured
      const debouncedPersist = writeDebounce && writeDebounce > 0
        ? createDebounced(persistState, writeDebounce)
        : persistState;

      if (writeDebounce && writeDebounce > 0) {
        cancelDebounce = () => (debouncedPersist as any).cancel?.();
      }

      // Subscribe to state changes and persist
      store.subscribe(debouncedPersist);
    },
    onDestroy() {
      // Cancel pending debounced writes
      if (cancelDebounce) {
        cancelDebounce();
      }
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
