/**
 * Tests for batch functionality.
 */

import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src/store.js';
import { batch, getBatchContext, isBatching, createBatch } from '../../src/batch.js';
import { getBatchStores, getBatchManagedStores } from '../../src/batch-context.js';

describe('batch', () => {
  it('should execute function immediately', () => {
    let executed = false;
    batch(() => {
      executed = true;
    });
    expect(executed).toBe(true);
  });

  it('should return function result', () => {
    const result = batch(() => {
      return 42;
    });
    expect(result).toBe(42);
  });

  it('should batch store updates', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);

    batch(() => {
      store.setState({ count: 1 });
      store.setState({ count: 2 });
      store.setState({ count: 3 });
    });

    // Should notify once with final state
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 3 }, { count: 0 });
  });

  it('should handle nested batches', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);

    batch(() => {
      store.setState({ count: 1 });
      batch(() => {
        store.setState({ count: 2 });
      });
      store.setState({ count: 3 });
    });

    // Should notify once with final state
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 3 }, { count: 0 });
  });

  it('should handle errors in batch', () => {
    const store = createStore({ count: 0 });

    expect(() => {
      batch(() => {
        store.setState({ count: 1 });
        throw new Error('Batch error');
      });
    }).toThrow('Batch error');

    // State should still be updated
    expect(store.getState()).toEqual({ count: 1 });
  });
});

describe('getBatchContext', () => {
  it('should return batch context', () => {
    const context = getBatchContext();
    expect(context).toBeDefined();
    expect(typeof context.batch).toBe('function');
  });

  it('should track batching state', () => {
    const context = getBatchContext();

    expect(context.isBatching()).toBe(false);

    context.batch(createStore({ count: 0 }), () => {
      expect(context.isBatching()).toBe(true);
    });

    expect(context.isBatching()).toBe(false);
  });
});

describe('isBatching - coverage tests', () => {
  // Test lines 30-31: isBatching function
  it('should return false when not batching', () => {
    expect(isBatching()).toBe(false);
  });

  it('should return true when batching', () => {
    batch(() => {
      expect(isBatching()).toBe(true);
    });
  });
});

describe('createBatch - coverage tests', () => {
  // Test lines 118-121: createBatch function
  it('should create store-bound batch function', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);

    const batchStore = createBatch(store);

    batchStore(() => {
      store.setState({ count: 1 });
      store.setState({ count: 2 });
    });

    // Should notify once
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 2 }, { count: 0 });
  });

  it('should handle multiple stores with separate batch functions', () => {
    const store1 = createStore({ count: 0 });
    const store2 = createStore({ value: 0 });

    const listener1 = vi.fn();
    const listener2 = vi.fn();
    store1.subscribe(listener1);
    store2.subscribe(listener2);

    const batchStore1 = createBatch(store1);
    const batchStore2 = createBatch(store2);

    batchStore1(() => {
      store1.setState({ count: 1 });
    });

    batchStore2(() => {
      store2.setState({ value: 1 });
    });

    // Each should notify independently
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});

describe('batch-context error handling', () => {
  // Test lines 46-47, 123-134: error handling in batch
  it('should handle errors and cleanup managed stores', () => {
    const store = createStore({ count: 0 });
    const context = getBatchContext();

    expect(() => {
      context.batch(store, () => {
        throw new Error('Test error');
      });
    }).toThrow('Test error');

    // After error, batching should be cleaned up
    expect(context.isBatching()).toBe(false);
  });

  it('should cleanup stores on batch error', () => {
    const store = createStore({ count: 0 });
    const context = getBatchContext();

    try {
      context.batch(store, () => {
        throw new Error('Error');
      });
    } catch (e) {
      // Expected
    }

    // Stores should be cleared
    expect(context.managedStores.size).toBe(0);
    expect(context.stores.size).toBe(0);
  });

  // Test getBatchStores and getBatchManagedStores functions
  it('should get batch stores', () => {
    const stores = getBatchStores();
    const managedStores = getBatchManagedStores();

    expect(stores).toBeInstanceOf(Set);
    expect(managedStores).toBeInstanceOf(Set);
  });

  // Test sharedBatchContext.depth getter
  it('should access depth getter on sharedBatchContext', () => {
    const context = getBatchContext();

    // Initially depth should be 0
    expect(context.depth).toBe(0);

    // During batch, depth should be > 0
    const store = createStore({ count: 0 });
    context.batch(store, () => {
      expect(context.depth).toBe(1);
    });

    // After batch, depth should be 0 again
    expect(context.depth).toBe(0);
  });
});
