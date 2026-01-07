/**
 * Plugin-specific types and interfaces.
 */

import type { Store, Plugin } from '../types.js';

/**
 * Persist plugin options.
 */
export interface PersistOptions<TState> {
  /** Storage key */
  key: string;
  /** Storage implementation (defaults to localStorage) */
  storage?: StorageLike;
  /** List of state keys to persist (whitelist) */
  whitelist?: Array<keyof TState>;
  /** List of state keys to exclude (blacklist) */
  blacklist?: Array<keyof TState>;

  // v1.2.0 Enhanced options

  /** Custom function to select which parts of state to persist */
  partialize?: (state: TState) => Partial<TState>;
  /** Custom merge strategy for hydration */
  merge?: (persistedState: Partial<TState>, currentState: TState) => TState;

  /** Version for migration support */
  version?: number;
  /** Migration function between versions */
  migrate?: (persistedState: unknown, version: number) => TState;

  /** Custom serialization */
  serialize?: (state: Partial<TState>) => string;
  /** Custom deserialization */
  deserialize?: (str: string) => Partial<TState>;

  /** Encryption function */
  encrypt?: (data: string) => string;
  /** Decryption function */
  decrypt?: (data: string) => string;

  /** Debounce writes to storage (ms) */
  writeDebounce?: number;

  /** Called when hydration starts */
  onRehydrateStorage?: (state: TState | undefined) => void;
  /** Called when hydration completes */
  onHydrationComplete?: (state: TState) => void;
  /** Called on persistence error */
  onPersistError?: (error: Error) => void;
}

/**
 * Storage interface for persistence.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Devtools plugin options.
 */
export interface DevtoolsOptions {
  /** Store name for DevTools */
  name?: string;
  /** Enable/disable DevTools */
  enabled?: boolean;
  /** Maximum number of states to keep in history */
  maxAge?: number;
}

/**
 * History plugin options.
 */
export interface HistoryOptions<TState> {
  /** Maximum number of past states to keep */
  limit?: number;
  /** Keys to track for history (empty array tracks all) */
  keys?: Array<keyof TState>;
}

/**
 * Sync plugin options.
 */
export interface SyncOptions {
  /** Channel name for BroadcastChannel */
  channel?: string;
}

/**
 * Selector plugin options.
 */
export interface SelectorOptions<TState> {
  /** Map of computed selectors */
  selectors: {
    [K in keyof TState]?: (state: TState) => TState[K];
  };
}

/**
 * History-enabled store interface.
 */
export interface HistoryStore<TState> extends Store<TState> {
  undo(): void;
  redo(): void;
  clearHistory(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}
