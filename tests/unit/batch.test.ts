/**
 * Tests for batch functionality.
 */

import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src/store.js';
import { batch, getBatchContext } from '../../src/batch.js';

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
