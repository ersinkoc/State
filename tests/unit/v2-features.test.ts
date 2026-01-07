import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStore } from '../../src/store.js';
import {
  subscribeWithOptions,
  createSubscriber,
  subscribeToMany,
  subscribeOnce,
} from '../../src/subscribe.js';
import {
  computed,
  combineComputed,
  memoizeSelector,
} from '../../src/computed.js';
import {
  createSlice,
  combineSlices,
  createNamespacedSlice,
  extendStore,
  resetSlices,
} from '../../src/slices.js';
import { logger, createLogger } from '../../src/plugins/logger.js';
import {
  effects,
  createEffect,
  createSimpleEffect,
  combineEffects,
  createDebouncedEffect,
} from '../../src/plugins/effects.js';
import {
  createMockStorage,
  spyOnStore,
  assertState,
  createTestStore,
  delay,
  flushMicrotasks,
  mockAction,
  snapshot,
  stateDiff,
} from '../../src/testing.js';

describe('Enhanced subscription', () => {
  it('should subscribe with options', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();

    const unsubscribe = subscribeWithOptions(
      store,
      (s) => s.count,
      listener,
      { fireImmediately: true }
    );

    expect(listener).toHaveBeenCalledWith(0, 0);

    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledWith(1, 0);

    unsubscribe();
    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should debounce notifications', async () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();

    subscribeWithOptions(
      store,
      (s) => s.count,
      listener,
      { debounce: 50 }
    );

    store.setState({ count: 1 });
    store.setState({ count: 2 });
    store.setState({ count: 3 });

    expect(listener).not.toHaveBeenCalled();

    await delay(100);
    expect(listener).toHaveBeenCalledTimes(1);
    // Debounced receives the final value and the value before debounce started
    expect(listener).toHaveBeenCalledWith(3, 2);
  });

  it('should throttle notifications', async () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();

    subscribeWithOptions(
      store,
      (s) => s.count,
      listener,
      { throttle: 50 }
    );

    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledWith(1, 0);

    store.setState({ count: 2 });
    store.setState({ count: 3 });

    await delay(100);
    expect(listener).toHaveBeenCalled();
  });

  it('should apply when condition', () => {
    const store = createStore({ count: 0, ready: false });
    const listener = vi.fn();

    subscribeWithOptions(
      store,
      (s) => s.count,
      listener,
      { when: (s) => s.ready }
    );

    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();

    store.setState({ ready: true, count: 2 });
    expect(listener).toHaveBeenCalledWith(2, 1);
  });

  it('should throw when using both debounce and throttle', () => {
    const store = createStore({ count: 0 });

    expect(() => {
      subscribeWithOptions(
        store,
        (s) => s.count,
        () => {},
        { debounce: 100, throttle: 100 }
      );
    }).toThrow('Cannot use both debounce and throttle options');
  });

  it('should create subscriber with preset options', async () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();

    const debouncedSubscribe = createSubscriber({ debounce: 50 });
    debouncedSubscribe(store, (s) => s.count, listener);

    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();

    await delay(100);
    expect(listener).toHaveBeenCalled();
  });

  it('should subscribe to many selectors', () => {
    const store = createStore({ count: 0, name: 'test' });
    const listener = vi.fn();

    subscribeToMany(
      store,
      { count: (s) => s.count, name: (s) => s.name },
      listener
    );

    store.setState({ count: 1 });
    // Listener receives current and previous values
    expect(listener).toHaveBeenCalledWith(
      { count: 1, name: 'test' },
      { count: 0, name: 'test' }
    );
  });

  it('should subscribe once', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();

    subscribeOnce(store, (s) => s.count, listener);

    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);

    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('Computed values', () => {
  it('should compute derived state', () => {
    const store = createStore({ items: [1, 2, 3] });

    const total = computed(store, (s) => s.items.reduce((sum, i) => sum + i, 0));

    expect(total()).toBe(6);
  });

  it('should memoize computed values', () => {
    const store = createStore({ items: [1, 2, 3] });
    const selector = vi.fn((s: { items: number[] }) => s.items.reduce((sum, i) => sum + i, 0));

    const total = computed(store, selector);

    total();
    total();
    total();

    // Should only compute once due to memoization
    expect(selector).toHaveBeenCalledTimes(1);
  });

  it('should recompute when state changes', () => {
    const store = createStore({ items: [1, 2, 3] });

    const total = computed(store, (s) => s.items.reduce((sum, i) => sum + i, 0));

    expect(total()).toBe(6);

    store.setState({ items: [1, 2, 3, 4] });
    expect(total()).toBe(10);
  });

  it('should subscribe to computed changes', () => {
    const store = createStore({ count: 1 });
    const doubled = computed(store, (s) => s.count * 2);
    const listener = vi.fn();

    doubled.subscribe(listener);

    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledWith(4, 2);
  });

  it('should invalidate cache', () => {
    const store = createStore({ count: 1 });
    const selector = vi.fn((s: { count: number }) => s.count * 2);
    const doubled = computed(store, selector);

    doubled();
    doubled();
    expect(selector).toHaveBeenCalledTimes(1);

    doubled.invalidate();
    doubled();
    expect(selector).toHaveBeenCalledTimes(2);
  });

  it('should get history', () => {
    const store = createStore({ count: 1 });
    const doubled = computed(store, (s) => s.count * 2, { cacheSize: 3 });

    expect(doubled()).toBe(2);
    store.setState({ count: 2 });
    expect(doubled()).toBe(4);
    store.setState({ count: 3 });
    expect(doubled()).toBe(6);

    expect(doubled.getHistory()).toEqual([6, 4, 2]);
  });

  it('should support lazy initialization', () => {
    const store = createStore({ count: 1 });
    const selector = vi.fn((s: { count: number }) => s.count * 2);

    const doubled = computed(store, selector, { lazy: true });

    expect(selector).not.toHaveBeenCalled();
    expect(doubled()).toBe(2);
    expect(selector).toHaveBeenCalled();
  });

  it('should destroy computed value', () => {
    const store = createStore({ count: 1 });
    const doubled = computed(store, (s) => s.count * 2);

    doubled.destroy();

    expect(() => doubled()).toThrow('Cannot access destroyed computed value');
  });

  it('should combine computed values', () => {
    const store = createStore({ price: 100, quantity: 2 });

    const total = computed(store, (s) => s.price * s.quantity);
    const tax = computed(store, (s) => s.price * s.quantity * 0.1);

    const grandTotal = combineComputed(
      [total, tax],
      ([totalVal, taxVal]) => totalVal + taxVal
    );

    expect(grandTotal()).toBe(220);

    store.setState({ price: 200 });
    expect(grandTotal()).toBe(440);
  });

  it('should memoize selector', () => {
    const selector = vi.fn((s: { count: number }) => s.count * 2);
    const memoized = memoizeSelector(selector);

    const state = { count: 1 };
    memoized(state);
    memoized(state);
    memoized(state);

    expect(selector).toHaveBeenCalledTimes(1);
  });
});

describe('Slices pattern', () => {
  it('should create a slice', () => {
    const counterSlice = createSlice('counter', (set, get) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));

    expect(counterSlice.name).toBe('counter');
    expect(typeof counterSlice.creator).toBe('function');
  });

  it('should combine slices', () => {
    const counterSlice = createSlice('counter', (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 })),
    }));

    const userSlice = createSlice('user', (set) => ({
      name: 'Guest',
      setName: (name: string) => set({ name }),
    }));

    const store = combineSlices(counterSlice, userSlice);

    expect(store.getState()).toEqual({ count: 0, name: 'Guest' });

    (store as any).increment();
    expect(store.getState().count).toBe(1);

    (store as any).setName('John');
    expect(store.getState().name).toBe('John');
  });

  it('should create namespaced slice', () => {
    const settingsSlice = createNamespacedSlice('settings', (set, get) => ({
      theme: 'dark',
      language: 'en',
      setTheme: (theme: string) => set({ theme }),
    }));

    const store = combineSlices(settingsSlice);
    const state = store.getState() as any;

    expect(state.settings).toEqual({ theme: 'dark', language: 'en' });
  });

  it('should extend store with slices', () => {
    const store = createStore({ count: 0 });

    const userSlice = createSlice('user', (set) => ({
      name: 'Guest',
      setName: (name: string) => set({ name }),
    }));

    const extended = extendStore(store, userSlice);
    const state = extended.getState() as any;

    expect(state.count).toBe(0);
    expect(state.name).toBe('Guest');
  });

  it('should log warning for resetSlices', () => {
    const store = createStore({ count: 0 });
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    resetSlices(store, 'test');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('Logger plugin', () => {
  it('should create logger with default options', () => {
    const loggerPlugin = logger();
    expect(loggerPlugin.name).toBe('logger');
    expect(loggerPlugin.version).toBe('1.0.0');
  });

  it('should be disabled when enabled: false', () => {
    const store = createStore({ count: 0 });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    store.use(logger({ enabled: false }));
    store.setState({ count: 1 });

    // Should not log anything when disabled
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should create logger with preset options', () => {
    const devLogger = createLogger({ collapsed: false, name: 'Dev' });
    const plugin = devLogger({ level: 'info' });

    expect(plugin.name).toBe('logger');
  });

  it('should filter state changes', () => {
    const store = createStore({ count: 0, temp: '' });
    const consoleSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    store.use(logger({
      filter: (state) => state.count > 0,
    }));

    store.setState({ temp: 'test' });
    expect(consoleSpy).not.toHaveBeenCalled();

    store.setState({ count: 1 });
    // Logger would be called since count > 0

    consoleSpy.mockRestore();
  });
});

describe('Effects plugin', () => {
  it('should create effects plugin', () => {
    const plugin = effects({ effects: [] });
    expect(plugin.name).toBe('effects');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should run effect on state change', async () => {
    const store = createStore({ userId: null as string | null, user: null });
    const effectFn = vi.fn();

    store.use(effects({
      effects: [{
        selector: (s) => s.userId,
        effect: effectFn,
      }],
    }));

    store.setState({ userId: '123' });
    await flushMicrotasks();

    expect(effectFn).toHaveBeenCalledWith('123', null, expect.any(Object));
  });

  it('should fire immediately if configured', () => {
    const store = createStore({ count: 5 });
    const effectFn = vi.fn();

    store.use(effects({
      effects: [{
        selector: (s) => s.count,
        effect: effectFn,
        fireImmediately: true,
      }],
    }));

    expect(effectFn).toHaveBeenCalledWith(5, 5, expect.any(Object));
  });

  it('should provide effect utilities', async () => {
    const store = createStore({ count: 0, doubled: 0 });
    let utils: any;

    store.use(effects({
      effects: [{
        selector: (s) => s.count,
        effect: (_val, _prev, u) => {
          utils = u;
        },
        fireImmediately: true,
      }],
    }));

    expect(utils.getState).toBeDefined();
    expect(utils.setState).toBeDefined();
    expect(utils.isActive).toBeDefined();
    expect(utils.cancel).toBeDefined();
    expect(utils.onlyIfActive).toBeDefined();
  });

  it('should cancel effect', async () => {
    const store = createStore({ count: 0 });
    let cancelled = false;
    let utils: any;

    store.use(effects({
      effects: [{
        selector: (s) => s.count,
        effect: (_val, _prev, u) => {
          utils = u;
          cancelled = !u.isActive();
        },
        fireImmediately: true,
      }],
    }));

    expect(utils.isActive()).toBe(true);
    utils.cancel();
    expect(utils.isActive()).toBe(false);
  });

  it('should create effect definition', () => {
    const def = createEffect(
      'test',
      (s: { count: number }) => s.count,
      () => {}
    );

    expect(def.name).toBe('test');
    expect(def.selector).toBeDefined();
    expect(def.effect).toBeDefined();
  });

  it('should create simple effect', () => {
    const def = createSimpleEffect(() => {});
    expect(def.selector).toBeDefined();
    expect(def.equalityFn).toBeDefined();
  });

  it('should combine effects', () => {
    const effect1 = createEffect('e1', (s: any) => s.a, () => {});
    const effect2 = createEffect('e2', (s: any) => s.b, () => {});

    const combined = combineEffects(effect1, effect2);
    expect(combined.effects).toHaveLength(2);
  });

  it('should create debounced effect', () => {
    const def = createDebouncedEffect(
      300,
      (s: { query: string }) => s.query,
      () => {}
    );

    expect(def.debounce).toBe(300);
  });

  it('should handle effect errors', async () => {
    const store = createStore({ count: 0 });
    const errorHandler = vi.fn();

    store.use(effects({
      effects: [{
        name: 'errorEffect',
        selector: (s) => s.count,
        effect: () => { throw new Error('Effect error'); },
      }],
      onError: errorHandler,
    }));

    store.setState({ count: 1 });
    await flushMicrotasks();

    expect(errorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      'errorEffect'
    );
  });

  it('should run cleanup on effect change', async () => {
    const store = createStore({ count: 0 });
    const cleanup = vi.fn();

    store.use(effects({
      effects: [{
        selector: (s) => s.count,
        effect: () => cleanup,
        fireImmediately: true,
      }],
    }));

    store.setState({ count: 1 });
    await flushMicrotasks();

    expect(cleanup).toHaveBeenCalled();
  });
});

describe('Testing utilities', () => {
  describe('createMockStorage', () => {
    it('should create mock storage', () => {
      const storage = createMockStorage();

      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');

      storage.removeItem('key');
      expect(storage.getItem('key')).toBeNull();

      storage.setItem('a', '1');
      storage.setItem('b', '2');
      expect(storage.getAll()).toEqual({ a: '1', b: '2' });

      storage.clear();
      expect(storage.getAll()).toEqual({});
    });
  });

  describe('spyOnStore', () => {
    it('should track state changes', () => {
      const store = createStore({ count: 0 });
      const spy = spyOnStore(store);

      store.setState({ count: 1 });
      store.setState({ count: 2 });

      expect(spy.changes).toHaveLength(2);
      expect(spy.lastState()?.count).toBe(2);
    });

    it('should reset tracked changes', () => {
      const store = createStore({ count: 0 });
      const spy = spyOnStore(store);

      store.setState({ count: 1 });
      spy.reset();

      expect(spy.changes).toHaveLength(0);
    });

    it('should wait for condition', async () => {
      const store = createStore({ ready: false });
      const spy = spyOnStore(store);

      setTimeout(() => store.setState({ ready: true }), 50);

      const state = await spy.waitFor((s) => s.ready);
      expect(state.ready).toBe(true);
    });

    it('should wait for changes', async () => {
      const store = createStore({ count: 0 });
      const spy = spyOnStore(store);

      setTimeout(() => {
        store.setState({ count: 1 });
        store.setState({ count: 2 });
      }, 50);

      const changes = await spy.waitForChanges(2);
      expect(changes).toHaveLength(2);
    });

    it('should timeout on waitFor', async () => {
      const store = createStore({ ready: false });
      const spy = spyOnStore(store);

      await expect(spy.waitFor((s) => s.ready, 100)).rejects.toThrow('timeout');
    });

    it('should resolve immediately if condition already met', async () => {
      const store = createStore({ ready: true });
      const spy = spyOnStore(store);

      const state = await spy.waitFor((s) => s.ready);
      expect(state.ready).toBe(true);
    });
  });

  describe('assertState', () => {
    it('should assert state equals', () => {
      const store = createStore({ count: 5, name: 'test' });
      const assert = assertState(store);

      expect(() => assert.toEqual({ count: 5 })).not.toThrow();
      expect(() => assert.toEqual({ count: 10 })).toThrow();
    });

    it('should assert selected value', () => {
      const store = createStore({ count: 5 });
      const assert = assertState(store);

      expect(() => assert.toHaveSelected((s) => s.count, 5)).not.toThrow();
      expect(() => assert.toHaveSelected((s) => s.count, 10)).toThrow();
    });

    it('should assert predicate match', () => {
      const store = createStore({ count: 5 });
      const assert = assertState(store);

      expect(() => assert.toMatch((s) => s.count > 0)).not.toThrow();
      expect(() => assert.toMatch((s) => s.count < 0)).toThrow();
    });
  });

  describe('createTestStore', () => {
    it('should create test store with utilities', () => {
      const testStore = createTestStore({ initialState: { count: 0 } });

      expect(testStore.store).toBeDefined();
      expect(testStore.spy).toBeDefined();
      expect(testStore.assert).toBeDefined();

      testStore.store.setState({ count: 1 });
      expect(testStore.spy?.lastState()?.count).toBe(1);

      testStore.destroy();
    });

    it('should reset test store', () => {
      const testStore = createTestStore({ initialState: { count: 0 } });

      testStore.store.setState({ count: 5 });
      testStore.reset();

      expect(testStore.store.getState().count).toBe(0);
      expect(testStore.spy?.changes).toHaveLength(0);

      testStore.destroy();
    });

    it('should work without spy', () => {
      const testStore = createTestStore({ initialState: { count: 0 }, spy: false });

      expect(testStore.spy).toBeUndefined();
      testStore.destroy();
    });
  });

  describe('delay', () => {
    it('should wait specified time', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });

  describe('mockAction', () => {
    it('should track action calls', () => {
      const action = mockAction((a: number, b: number) => a + b);

      expect(action(1, 2)).toBe(3);
      expect(action(3, 4)).toBe(7);

      expect(action.callCount).toBe(2);
      expect(action.calls).toEqual([[1, 2], [3, 4]]);

      action.reset();
      expect(action.callCount).toBe(0);
    });
  });

  describe('snapshot', () => {
    it('should create state snapshot', () => {
      const store = createStore({ count: 0, nested: { value: 1 } });

      const snap = snapshot(store);
      store.setState({ count: 5 });

      expect(snap.count).toBe(0);
      expect(store.getState().count).toBe(5);
    });
  });

  describe('stateDiff', () => {
    it('should calculate state diff', () => {
      const before = { count: 0, name: 'test' };
      const after = { count: 5, name: 'test' };

      const diff = stateDiff(before, after);

      expect(diff).toEqual({ count: { before: 0, after: 5 } });
    });
  });
});
