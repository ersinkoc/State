import type { Store } from './types.js';
import type { BatchContext } from './batch-context.js';
import {
  sharedBatchContext,
  isBatching as checkIsBatching,
  getBatchDepth,
  incrementBatchDepth,
  decrementBatchDepth,
  getBatchManagedStores,
  clearBatchStores,
} from './batch-context.js';

/**
 * Get the global batch context.
 *
 * @internal
 */
export function getBatchContext(): BatchContext {
  return sharedBatchContext;
}

/**
 * Check if currently in a batch context.
 *
 * @returns true if batching
 *
 * @internal
 */
export function isBatching(): boolean {
  return checkIsBatching();
}

/**
 * Batch multiple state updates into a single notification.
 *
 * This reduces the number of subscriber notifications when making multiple
 * state updates in sequence. All updates within the batch function will
 * result in only one notification to subscribers.
 *
 * @param fn - Function containing state updates
 * @returns The return value of fn
 *
 * @example
 * ```typescript
 * import { batch, createStore } from '@oxog/state';
 *
 * const store = createStore({ count: 0, name: '' });
 *
 * // Without batch - 3 re-renders in React
 * store.setState({ count: 1 });
 * store.setState({ count: 2 });
 * store.setState({ name: 'John' });
 *
 * // With batch - 1 re-render in React
 * batch(() => {
 *   store.setState({ count: 1 });
 *   store.setState({ count: 2 });
 *   store.setState({ name: 'John' });
 * });
 * ```
 */
export function batch<T>(fn: () => T): T {
  // Increment depth first to signal batching is active
  incrementBatchDepth();

  try {
    const result = fn();
    decrementBatchDepth();

    if (getBatchDepth() === 0) {
      // End batch on all managed stores
      // Create a copy to avoid mutation during iteration
      const storesArray = Array.from(getBatchManagedStores());
      for (const s of storesArray) {
        if ('flushNotifications' in s) {
          // Only flush notifications, don't call endBatch (which would decrement batchDepth again)
          (s as any).flushNotifications();
        }
      }
      clearBatchStores();
    }

    return result;
  } catch (error) {
    decrementBatchDepth();
    // Cleanup on error
    const storesArray = Array.from(getBatchManagedStores());
    for (const s of storesArray) {
      if ('flushNotifications' in s) {
        (s as any).flushNotifications();
      }
    }
    clearBatchStores();
    throw error;
  }
}

/**
 * Create a store-bound batch function.
 *
 * @param store - The store to batch
 * @returns A batch function bound to the store
 *
 * @example
 * ```typescript
 * import { createStore, createBatch } from '@oxog/state';
 *
 * const store = createStore({ count: 0 });
 * const batchStore = createBatch(store);
 *
 * batchStore(() => {
 *   store.setState({ count: 1 });
 *   store.setState({ count: 2 });
 * });
 * ```
 */
export function createBatch(store: Store<any>): <T>(fn: () => T) => T {
  return <T>(fn: () => T): T => {
    return sharedBatchContext.batch(store, fn);
  };
}
