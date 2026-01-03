/**
 * History plugin - Undo/redo functionality.
 *
 * Tracks state changes and provides undo/redo methods.
 *
 * @example
 * ```typescript
 * import { createStore, history } from '@oxog/state';
 *
 * const store = createStore({ count: 0 })
 *   .use(history({ limit: 100 }));
 *
 * // Now store has undo() and redo() methods
 * store.setState({ count: 1 });
 * store.setState({ count: 2 });
 * store.undo(); // { count: 1 }
 * store.redo(); // { count: 2 }
 * ```
 */

import type { Plugin, Store } from '../types.js';
import type { HistoryOptions, HistoryStore } from './types.js';

/**
 * History state for tracking past and future states.
 */
interface HistoryState<TState> {
  past: TState[];
  present: TState;
  future: TState[];
}

/**
 * Create a history plugin.
 *
 * @param options - Plugin options
 * @returns A history plugin
 *
 * @example
 * ```typescript
 * import { history } from '@oxog/state';
 *
 * // Default options
 * const store = createStore({ count: 0 })
 *   .use(history());
 *
 * // Custom limit
 * const store = createStore({ count: 0 })
 *   .use(history({ limit: 50 }));
 *
 * // Track specific keys only
 * const store = createStore({ count: 0, temp: '' })
 *   .use(history({ keys: ['count'] }));
 * ```
 */
export function history<TState>(options: HistoryOptions<TState> = {}): Plugin<TState> {
  const { limit = 50, keys } = options;
  let historyState: HistoryState<TState> | null = null;
  let currentStore: Store<TState> | null = null;
  let isInternalUpdate = false; // Flag to skip recording during undo/redo

  return {
    name: 'history',
    version: '1.0.0',
    install(store: Store<TState>) {
      currentStore = store;

      // Initialize history
      historyState = {
        past: [],
        present: store.getState(),
        future: [],
      };

      // Subscribe to state changes
      store.subscribe((state) => {
        if (!historyState || isInternalUpdate) return;

        const previousPresent = historyState.present;
        const newPresent = state;

        // Check if state actually changed (respect keys if provided)
        let hasChanged = true;
        if (keys && keys.length > 0) {
          hasChanged = keys.some((key) => {
            return (previousPresent as any)[key] !== (newPresent as any)[key];
          });
        } else {
          hasChanged = previousPresent !== newPresent;
        }

        if (!hasChanged) return;

        // Add to history
        historyState.past.push(previousPresent);
        if (historyState.past.length > limit) {
          historyState.past.shift();
        }
        historyState.present = newPresent;
        historyState.future = [];
      });

      // Add undo method
      (store as any).undo = () => {
        if (!historyState || historyState.past.length === 0) return;

        const previous = historyState.past.pop()!;
        historyState.future.push(historyState.present);
        historyState.present = previous;

        // Update store state without triggering history recording
        isInternalUpdate = true;
        store.setState(previous as any);
        isInternalUpdate = false;
      };

      // Add redo method
      (store as any).redo = () => {
        if (!historyState || historyState.future.length === 0) return;

        const next = historyState.future.pop()!;
        historyState.past.push(historyState.present);
        historyState.present = next;

        // Update store state without triggering history recording
        isInternalUpdate = true;
        store.setState(next as any);
        isInternalUpdate = false;
      };

      // Add clear history method
      (store as any).clearHistory = () => {
        if (!historyState) return;
        historyState.past = [];
        historyState.future = [];
      };

      // Add canUndo method
      (store as any).canUndo = () => {
        return historyState !== null && historyState.past.length > 0;
      };

      // Add canRedo method
      (store as any).canRedo = () => {
        return historyState !== null && historyState.future.length > 0;
      };
    },
    onDestroy() {
      historyState = null;
      currentStore = null;
    },
  };
}

/**
 * Check if a store has history capabilities.
 *
 * @param store - The store to check
 * @returns true if store supports undo/redo
 *
 * @example
 * ```typescript
 * import { hasHistory } from '@oxog/state';
 *
 * if (hasHistory(store)) {
 *   store.undo();
 *   store.redo();
 * }
 * ```
 */
export function hasHistory<TState>(store: Store<TState>): store is HistoryStore<TState> {
  return (
    typeof (store as any).undo === 'function' &&
    typeof (store as any).redo === 'function'
  );
}
