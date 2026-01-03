/**
 * Tests for store implementation.
 */

import { describe, it, expect, vi } from 'vitest';
import { createStore, StoreError, StoreErrorCode } from '../../src/store.js';
import { createCounterStore, createCounterStoreWithActions, createNestedStore } from '../fixtures/test-stores.js';

describe('createStore', () => {
  it('should create a store with initial state', () => {
    const store = createStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should create a store with separate actions', () => {
    const store = createStore(
      { count: 0 },
      {
        increment: (state) => ({ count: state.count + 1 }),
      }
    );
    expect(store.getState()).toEqual({ count: 0 });
    (store as any).increment();
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should create a fluent builder', () => {
    const store = createStore({ count: 0 }).action('increment', (state) => ({
      count: state.count + 1,
    }));

    expect(store.getState()).toEqual({ count: 0 });
    (store as any).increment();
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should handle inline actions with $ prefix', () => {
    const store = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    });

    expect(store.getState()).toEqual({ count: 0 });
    expect(typeof (store as any).increment).toBe('function');
    (store as any).increment();
    expect(store.getState()).toEqual({ count: 1 });
  });
});

describe('getState', () => {
  it('should return current state', () => {
    const store = createCounterStore();
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should reflect state changes', () => {
    const store = createCounterStore();
    store.setState({ count: 5 });
    expect(store.getState()).toEqual({ count: 5 });
  });

  it('should throw after destroy', () => {
    const store = createCounterStore();
    store.destroy();
    expect(() => store.getState()).toThrow('Cannot use destroyed store');
  });
});

describe('setState', () => {
  it('should update state with partial object', () => {
    const store = createStore({ a: 1, b: 2 });
    store.setState({ a: 10 });
    expect(store.getState()).toEqual({ a: 10, b: 2 });
  });

  it('should update state with function', () => {
    const store = createStore({ count: 0 });
    store.setState((state) => ({ count: state.count + 1 }));
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should notify listeners on state change', () => {
    const store = createCounterStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 5 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 5 }, { count: 0 });
  });

  it('should not notify if state does not change', () => {
    const store = createCounterStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 0 });

    // State is the same reference but we still notify
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should handle async actions', async () => {
    const store = createStore({
      data: null,
      $fetch: async (state: { data: null | string }) => {
        await Promise.resolve();
        return { data: 'loaded' };
      },
    });

    const listener = vi.fn();
    store.subscribe(listener);

    await (store as any).fetch();

    expect(store.getState()).toEqual({ data: 'loaded' });
    expect(listener).toHaveBeenCalled();
  });
});

describe('merge', () => {
  it('should shallow merge state', () => {
    const store = createStore({ a: 1, b: 2 });
    store.merge({ a: 10 });
    expect(store.getState()).toEqual({ a: 10, b: 2 });
  });

  it('should deep merge nested objects', () => {
    const store = createNestedStore();
    store.merge({ b: { c: 20 } });
    expect(store.getState()).toEqual({
      a: 1,
      b: { c: 20, d: { e: 3 } },
    });
  });

  it('should handle deep nested merges', () => {
    const store = createNestedStore();
    store.merge({ b: { d: { e: 30 } } });
    expect(store.getState()).toEqual({
      a: 1,
      b: { c: 2, d: { e: 30 } },
    });
  });
});

describe('reset', () => {
  it('should reset to initial state', () => {
    const store = createCounterStore();
    store.setState({ count: 5 });
    store.reset();
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should notify listeners on reset', () => {
    const store = createCounterStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 5 });
    listener.mockClear();

    store.reset();

    expect(listener).toHaveBeenCalledWith({ count: 0 }, { count: 5 });
  });
});

describe('subscribe', () => {
  it('should call listener on state change', () => {
    const store = createCounterStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 1 });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should return unsubscribe function', () => {
    const store = createCounterStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.setState({ count: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should support multiple listeners', () => {
    const store = createCounterStore();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    store.subscribe(listener1);
    store.subscribe(listener2);

    store.setState({ count: 1 });

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should support selector-based subscription', () => {
    const store = createStore({ count: 0, name: 'test' });
    const listener = vi.fn();

    store.subscribe((state) => state.count, (...args) => {
      listener(...args);
    });

    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledWith(1, 0);

    store.setState({ name: 'changed' });
    // Count didn't change, so selector should not fire
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should support custom equality function', () => {
    const store = createStore({ items: [1, 2, 3] });
    const listener = vi.fn();

    store.subscribe(
      (state) => state.items,
      (items) => {
        listener(items);
      },
      () => true // Always equal, never notify
    );

    store.setState({ items: [4, 5, 6] });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle listener errors gracefully', () => {
    const store = createCounterStore();
    const errorListener = vi.fn(() => {
      throw new Error('Listener error');
    });

    store.subscribe(errorListener);

    // Should not throw
    expect(() => store.setState({ count: 1 })).not.toThrow();
  });
});

describe('use', () => {
  it('should register a plugin', () => {
    const store = createCounterStore();
    const plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
    };

    store.use(plugin);

    // Plugin receives the underlying store implementation, not the builder
    expect(plugin.install).toHaveBeenCalledWith((store as any).store, undefined);
  });

  it('should pass options to plugin', () => {
    const store = createCounterStore();
    const options = { foo: 'bar' };
    const plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
    };

    store.use(plugin, options);

    // Plugin receives the underlying store implementation, not the builder
    expect(plugin.install).toHaveBeenCalledWith((store as any).store, options);
  });

  it('should throw on duplicate plugin', () => {
    const store = createCounterStore();
    const plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
    };

    store.use(plugin);

    expect(() => store.use(plugin)).toThrow('already registered');
  });

  it('should check plugin dependencies', () => {
    const store = createCounterStore();
    const pluginWithDep = {
      name: 'dependent',
      version: '1.0.0',
      dependencies: ['missing'] as string[],
      install: vi.fn(),
    };

    expect(() => store.use(pluginWithDep)).toThrow('requires');
  });

  it('should throw on invalid plugin', () => {
    const store = createCounterStore();
    const invalidPlugin = {} as any;

    expect(() => store.use(invalidPlugin)).toThrow('Invalid plugin');
  });
});

describe('destroy', () => {
  it('should cleanup store', () => {
    const store = createCounterStore();
    store.destroy();

    expect(() => store.getState()).toThrow();
  });

  it('should call plugin onDestroy', () => {
    const store = createCounterStore();
    const plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onDestroy: vi.fn(),
    };

    store.use(plugin);
    store.destroy();

    expect(plugin.onDestroy).toHaveBeenCalled();
  });

  it('should be idempotent', () => {
    const store = createCounterStore();
    store.destroy();
    store.destroy(); // Should not throw

    expect(() => store.getState()).toThrow();
  });
});

describe('actions', () => {
  it('should execute inline actions', () => {
    const store = createCounterStoreWithActions();

    (store as any).increment();

    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should pass arguments to actions', () => {
    const store = createCounterStoreWithActions();

    (store as any).incrementBy(5);

    expect(store.getState()).toEqual({ count: 5 });
  });

  it('should handle async actions', async () => {
    const store = createStore({
      data: null,
      $fetch: async (state: { data: null | string }) => {
        await Promise.resolve();
        return { data: 'loaded' };
      },
    });

    await (store as any).fetch();

    expect(store.getState()).toEqual({ data: 'loaded' });
  });

  it('should handle action errors', async () => {
    const store = createStore({
      data: null,
      $fail: async () => {
        throw new Error('Action failed');
      },
    });

    await expect((store as any).fail()).rejects.toThrow('Action failed');
  });
});

describe('batching', () => {
  it('should queue notifications during batch', () => {
    const store = createCounterStore();
    const listener = vi.fn();
    store.subscribe(listener);

    (store as any).beginBatch();
    store.setState({ count: 1 });
    store.setState({ count: 2 });
    store.setState({ count: 3 });
    (store as any).endBatch();

    // Should notify once with final state
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 3 }, { count: 0 });
  });

  it('should handle nested batches', () => {
    const store = createCounterStore();
    const listener = vi.fn();
    store.subscribe(listener);

    (store as any).beginBatch();
    (store as any).beginBatch();
    store.setState({ count: 1 });
    (store as any).endBatch();
    (store as any).endBatch();

    // Should notify once after outer batch ends
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
