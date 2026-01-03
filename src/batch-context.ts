/**
 * Shared batch context singleton.
 * This ensures that all modules access the same batch context instance.
 * Using module-level variables and functions for maximum bundler compatibility.
 */

import type { Store } from './types.js';

// Module-level state - these are guaranteed to be singletons
let batchDepth = 0;
const batchStores = new Set<Store<any>>();
const batchManagedStores = new Set<Store<any>>();

/**
 * Check if currently batching.
 */
export function isBatching(): boolean {
  return batchDepth > 0;
}

/**
 * Get current batch depth.
 */
export function getBatchDepth(): number {
  return batchDepth;
}

/**
 * Increment batch depth.
 */
export function incrementBatchDepth(): number {
  return ++batchDepth;
}

/**
 * Decrement batch depth.
 */
export function decrementBatchDepth(): number {
  return --batchDepth;
}

/**
 * Get all batch stores.
 */
export function getBatchStores(): Set<Store<any>> {
  return batchStores;
}

/**
 * Get all managed stores.
 */
export function getBatchManagedStores(): Set<Store<any>> {
  return batchManagedStores;
}

/**
 * Clear all batch stores.
 */
export function clearBatchStores(): void {
  batchStores.clear();
  batchManagedStores.clear();
}

/**
 * Add a store to batch tracking.
 */
export function addBatchStore(store: Store<any>): void {
  batchStores.add(store);
}

/**
 * Add a store to managed tracking.
 */
export function addManagedStore(store: Store<any>): void {
  batchManagedStores.add(store);
}

/**
 * Check if a store is managed.
 */
export function isStoreManaged(store: Store<any>): boolean {
  return batchManagedStores.has(store);
}

// Legacy exports for compatibility
export const sharedBatchContext = {
  get depth() { return batchDepth; },
  get stores() { return batchStores; },
  get managedStores() { return batchManagedStores; },

  isBatching,
  batch<T>(store: Store<any>, fn: () => T): T {
    const wasAlreadyBatching = isStoreManaged(store);

    incrementBatchDepth();
    addBatchStore(store);

    // Call beginBatch on the store if it has one and we haven't already
    if (!wasAlreadyBatching && 'beginBatch' in store) {
      (store as any).beginBatch();
      addManagedStore(store);
    }

    try {
      const result = fn();
      decrementBatchDepth();

      if (getBatchDepth() === 0) {
        // Flush all pending notifications
        for (const s of getBatchManagedStores()) {
          if ('flushNotifications' in s) {
            (s as any).flushNotifications();
          }
          if ('endBatch' in s) {
            (s as any).endBatch();
          }
        }
        clearBatchStores();
      }

      return result;
    } catch (error) {
      decrementBatchDepth();
      // Cleanup on error
      if (getBatchDepth() === 0) {
        for (const s of getBatchManagedStores()) {
          if ('endBatch' in s) {
            (s as any).endBatch();
          }
        }
        clearBatchStores();
      }
      throw error;
    }
  },
};

// Type for BatchContext (legacy)
export interface BatchContext {
  depth: number;
  stores: Set<Store<any>>;
  managedStores: Set<Store<any>>;
  isBatching(): boolean;
  batch<T>(store: Store<any>, fn: () => T): T;
}
