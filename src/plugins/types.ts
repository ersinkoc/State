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
