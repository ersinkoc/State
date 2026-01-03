/**
 * Tests for plugins.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from '../../src/store.js';
import {
  persist,
  devtools,
  history,
  sync,
  immer,
  selector,
  hasHistory,
  produce,
  sessionStorage,
} from '../../src/plugins/index.js';

describe('persist plugin', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
  });

  const createMockStorage = () => ({
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  });

  it('should hydrate state from storage', () => {
    mockStorage['test-key'] = JSON.stringify({ count: 5 });

    const storage = createMockStorage();
    const store = createStore({ count: 0 }).use(
      persist({ key: 'test-key', storage })
    );

    expect(store.getState()).toEqual({ count: 5 });
  });

  it('should persist state changes', () => {
    const storage = createMockStorage();
    const store = createStore({ count: 0 }).use(
      persist({ key: 'test-key', storage })
    );

    store.setState({ count: 10 });

    expect(mockStorage['test-key']).toBe(JSON.stringify({ count: 10 }));
  });

  it('should whitelist keys', () => {
    const storage = createMockStorage();
    const store = createStore({ count: 0, temp: '' }).use(
      persist({ key: 'test-key', storage, whitelist: ['count'] as any })
    );

    store.setState({ count: 5, temp: 'ignored' });

    const saved = JSON.parse(mockStorage['test-key']!);
    expect(saved).toEqual({ count: 5 });
    expect(saved.temp).toBeUndefined();
  });

  it('should blacklist keys', () => {
    const storage = createMockStorage();
    const store = createStore({ count: 0, temp: '' }).use(
      persist({ key: 'test-key', storage, blacklist: ['temp'] as any })
    );

    store.setState({ count: 5, temp: 'ignored' });

    const saved = JSON.parse(mockStorage['test-key']!);
    expect(saved).toEqual({ count: 5 });
    expect(saved.temp).toBeUndefined();
  });

  it('should handle storage errors gracefully', () => {
    const errorStorage = {
      getItem: () => {
        throw new Error('Storage error');
      },
      setItem: () => {
        throw new Error('Storage error');
      },
      removeItem: () => {},
    };

    expect(() => {
      createStore({ count: 0 }).use(persist({ key: 'test-key', storage: errorStorage as any }));
    }).not.toThrow();
  });
});

describe('devtools plugin', () => {
  it('should connect to devtools when available', () => {
    const mockConnection = {
      init: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn(),
    };

    const mockExtension = {
      connect: vi.fn(() => mockConnection),
    };

    (global as any).__REDUX_DEVTOOLS_EXTENSION__ = mockExtension;

    const store = createStore({ count: 0 }).use(devtools({ name: 'Test' }));

    expect(mockExtension.connect).toHaveBeenCalledWith({ name: 'Test' });
    expect(mockConnection.init).toHaveBeenCalledWith({ count: 0 });

    delete (global as any).__REDUX_DEVTOOLS_EXTENSION__;
  });

  it('should send state changes to devtools', () => {
    const mockConnection = {
      init: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn(),
    };

    const mockExtension = {
      connect: vi.fn(() => mockConnection),
    };

    (global as any).__REDUX_DEVTOOLS_EXTENSION__ = mockExtension;

    const store = createStore({ count: 0 }).use(devtools({ name: 'Test' }));

    store.setState({ count: 5 });

    expect(mockConnection.send).toHaveBeenCalled();

    delete (global as any).__REDUX_DEVTOOLS_EXTENSION__;
  });

  it('should work without devtools', () => {
    const store = createStore({ count: 0 }).use(devtools({ name: 'Test' }));

    expect(() => store.setState({ count: 1 })).not.toThrow();
  });

  it('should respect enabled option', () => {
    const mockConnection = {
      init: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn(),
    };

    const mockExtension = {
      connect: vi.fn(() => mockConnection),
    };

    (global as any).__REDUX_DEVTOOLS_EXTENSION__ = mockExtension;

    const store = createStore({ count: 0 }).use(devtools({ name: 'Test', enabled: false }));

    expect(mockConnection.init).not.toHaveBeenCalled();

    delete (global as any).__REDUX_DEVTOOLS_EXTENSION__;
  });
});

describe('history plugin', () => {
  it('should add undo/redo methods', () => {
    const store = createStore({ count: 0 }).use(history());

    expect(typeof (store as any).undo).toBe('function');
    expect(typeof (store as any).redo).toBe('function');
  });

  it('should track state changes', () => {
    const store = createStore({ count: 0 }).use(history());

    store.setState({ count: 1 });
    store.setState({ count: 2 });
    store.setState({ count: 3 });

    (store as any).undo();
    expect(store.getState()).toEqual({ count: 2 });

    (store as any).undo();
    expect(store.getState()).toEqual({ count: 1 });

    (store as any).redo();
    expect(store.getState()).toEqual({ count: 2 });
  });

  it('should respect limit option', () => {
    const store = createStore({ count: 0 }).use(history({ limit: 2 }));

    store.setState({ count: 1 });
    store.setState({ count: 2 });
    store.setState({ count: 3 });

    (store as any).undo();
    expect(store.getState()).toEqual({ count: 2 });

    (store as any).undo();
    expect(store.getState()).toEqual({ count: 1 });

    // Should not undo further (limit exceeded)
    (store as any).undo();
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should provide canUndo and canRedo', () => {
    const store = createStore({ count: 0 }).use(history());

    expect((store as any).canUndo()).toBe(false);
    expect((store as any).canRedo()).toBe(false);

    store.setState({ count: 1 });

    expect((store as any).canUndo()).toBe(true);
    expect((store as any).canRedo()).toBe(false);

    (store as any).undo();

    expect((store as any).canUndo()).toBe(false);
    expect((store as any).canRedo()).toBe(true);
  });

  it('should clear history', () => {
    const store = createStore({ count: 0 }).use(history());

    store.setState({ count: 1 });
    (store as any).clearHistory();

    expect((store as any).canUndo()).toBe(false);
  });

  it('should work with hasHistory type guard', () => {
    const store = createStore({ count: 0 }).use(history());

    expect(hasHistory(store)).toBe(true);

    if (hasHistory(store)) {
      store.undo();
      store.redo();
      store.clearHistory();
    }
  });
});

describe('sync plugin', () => {
  it('should create broadcast channel', () => {
    const store = createStore({ count: 0 }).use(sync({ channel: 'test' }));

    expect(() => store.setState({ count: 1 })).not.toThrow();
  });

  it('should handle missing BroadcastChannel', () => {
    const OriginalBroadcastChannel = (global as any).BroadcastChannel;
    delete (global as any).BroadcastChannel;

    const store = createStore({ count: 0 }).use(sync({ channel: 'test' }));

    expect(() => store.setState({ count: 1 })).not.toThrow();

    (global as any).BroadcastChannel = OriginalBroadcastChannel;
  });
});

describe('immer plugin', () => {
  it('should enable mutable-style updates', () => {
    const store = createStore({
      items: [{ id: 1, name: 'Item 1' }],
    }).use(immer());

    store.setState((draft: any) => {
      draft.items[0].name = 'Updated';
    });

    expect(store.getState().items[0].name).toBe('Updated');
  });

  it('should work with produce function', () => {
    const state = {
      items: [{ id: 1, name: 'Item 1' }],
    };

    const newState = produce(state, (draft: any) => {
      draft.items[0].name = 'Updated';
    });

    expect(newState.items[0].name).toBe('Updated');
    expect(state).not.toBe(newState);
  });
});

describe('selector plugin', () => {
  it('should create computed values', () => {
    const store = createStore({
      items: [1, 2, 3],
      filter: 'all',
    }).use(
      selector({
        selectors: {
          total: (state: any) => state.items.reduce((sum: number, n: number) => sum + n, 0),
        },
      })
    );

    const state = store.getState();
    expect((state as any).total).toBe(6);
  });

  it('should recompute on state change', () => {
    const store = createStore({
      items: [1, 2, 3],
    }).use(
      selector({
        selectors: {
          total: (state: any) => state.items.reduce((sum: number, n: number) => sum + n, 0),
        },
      })
    );

    expect((store.getState() as any).total).toBe(6);

    store.setState({ items: [4, 5, 6] });

    expect((store.getState() as any).total).toBe(15);
  });
});
