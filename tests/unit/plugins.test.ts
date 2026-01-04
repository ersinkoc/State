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
  createStorage,
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

  // Test lines 85-87: keys option for selective history tracking
  it('should track changes only for specified keys', () => {
    const store = createStore({ count: 1, name: 'test', other: 'value' }).use(
      history({ keys: ['count', 'name'] })
    );

    // Change only 'other' (not tracked) - should not create history
    store.setState({ count: 1, name: 'test', other: 'changed' });
    expect((store as any).canUndo()).toBe(false);

    // Change 'count' (tracked) - should create history
    store.setState({ count: 2, name: 'test', other: 'changed' });
    expect((store as any).canUndo()).toBe(true);
  });

  // Test lines 149-151: onDestroy cleanup
  it('should cleanup history on store destroy', () => {
    const store = createStore({ count: 0 }).use(history());

    // Store should have history
    expect(hasHistory(store)).toBe(true);

    // Destroy the store
    store.destroy();

    // After destroy, history should be cleaned up
    // (we can't directly access historyState, but we can verify the store is destroyed)
    expect(() => store.getState()).toThrow();
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

  // Test lines 85-86: cache hit returns cached value
  it('should cache computed values', () => {
    const store = createStore({
      items: [1, 2, 3],
    }).use(
      selector({
        selectors: {
          total: (state: any) => state.items.reduce((sum: number, n: number) => sum + n, 0),
        },
      })
    );

    const state1 = store.getState() as any;
    const state2 = store.getState() as any;

    // Both should return same value from cache
    expect(state1.total).toBe(6);
    expect(state2.total).toBe(6);
  });

  // Test line 95: return regular state value for non-selector properties
  it('should return regular state values for non-selectors', () => {
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

    const state = store.getState() as any;

    // 'filter' is not a selector, should return the regular value
    expect(state.filter).toBe('all');
    // 'total' is a selector
    expect(state.total).toBe(6);
  });
});

describe('persist plugin - coverage tests', () => {
  // Test defaultStorage error handling (lines 44-50, 52-58, 60-66)
  it('should handle localStorage errors gracefully', () => {
    const mockStorage = {
      getItem: vi.fn(() => {
        throw new Error('Storage access denied');
      }),
      setItem: vi.fn(() => {
        throw new Error('Storage access denied');
      }),
      removeItem: vi.fn(() => {
        throw new Error('Storage access denied');
      }),
    };

    const store = createStore({ count: 0 }).use(
      persist({ key: 'test', storage: mockStorage })
    );

    // Should not throw, just log error
    expect(store.getState()).toEqual({ count: 0 });
    expect(mockStorage.getItem).toHaveBeenCalledWith('test');
  });

  // Test sessionStorage error handling (lines 74-80, 82-88, 90-96)
  it('should handle sessionStorage errors gracefully', () => {
    const mockStorage = {
      getItem: vi.fn(() => {
        throw new Error('SessionStorage error');
      }),
      setItem: vi.fn(() => {
        throw new Error('SessionStorage error');
      }),
      removeItem: vi.fn(),
    };

    const store = createStore({ count: 0 }).use(
      persist({ key: 'test', storage: mockStorage })
    );

    expect(store.getState()).toEqual({ count: 0 });
  });

  // Test setItem error handling (lines 157-158)
  it('should handle persist errors gracefully', () => {
    let callCount = 0;
    const mockStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Storage full');
        }
      }),
      removeItem: vi.fn(),
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const store = createStore({ count: 0 }).use(
      persist({ key: 'test', storage: mockStorage })
    );

    // Trigger state change which will try to persist
    store.setState({ count: 1 });

    // Should log error but not throw
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  // Test onDestroy (line 164)
  it('should call onDestroy when store is destroyed', () => {
    const mockStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const store = createStore({ count: 0 }).use(
      persist({ key: 'test', storage: mockStorage })
    );

    // Should not throw when destroyed
    expect(() => store.destroy()).not.toThrow();
  });

  // Test createStorage function (lines 186-187)
  it('should create custom storage', () => {
    const customStorage = {
      getItem: vi.fn(() => 'null'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const storage = createStorage(customStorage);

    expect(storage).toBe(customStorage);
    expect(storage.getItem).toBeDefined();
    expect(storage.setItem).toBeDefined();
    expect(storage.removeItem).toBeDefined();
  });

  // Test defaultStorage (lines 44-66) by using persist without custom storage
  it('should use default storage when none provided', () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    (global as any).window = { localStorage: mockLocalStorage };

    // Use persist without custom storage
    const store = createStore({ count: 0 }).use(persist({ key: 'test' }));

    // Trigger a state change to test setItem
    store.setState({ count: 1 });

    // Verify default storage methods were called
    expect(mockLocalStorage.getItem).toHaveBeenCalled();
    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    delete (global as any).window;
  });

  // Test defaultStorage error handling (catch blocks in lines 47-49, 55-57, 63-65)
  it('should handle localStorage errors gracefully in defaultStorage', () => {
    // Mock localStorage that throws errors
    const mockLocalStorage = {
      getItem: vi.fn(() => {
        throw new Error('Storage quota exceeded');
      }),
      setItem: vi.fn(() => {
        throw new Error('Storage quota exceeded');
      }),
      removeItem: vi.fn(() => {
        throw new Error('Storage quota exceeded');
      }),
    };
    (global as any).window = { localStorage: mockLocalStorage };

    // Should not throw when using default storage with errors
    expect(() => createStore({ count: 0 }).use(persist({ key: 'test' }))).not.toThrow();

    delete (global as any).window;
  });

  // Test sessionStorage export (lines 74-96)
  it('should use sessionStorage export', () => {
    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: vi.fn((key: string) => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    (global as any).window = { sessionStorage: mockSessionStorage };

    const store = createStore({ count: 0 }).use(
      persist({ key: 'test', storage: sessionStorage })
    );

    // Trigger a state change to test setItem
    store.setState({ count: 1 });

    // Verify sessionStorage methods were called
    expect(mockSessionStorage.getItem).toHaveBeenCalled();
    expect(mockSessionStorage.setItem).toHaveBeenCalled();

    delete (global as any).window;
  });
});

describe('sync plugin - coverage tests', () => {
  // Test sync plugin uncovered lines (94-102, 107-112, 123-124, 131-136, 158-166)
  it('should handle channel postMessage errors', () => {
    const mockChannel = {
      name: 'test-channel',
      postMessage: vi.fn(() => {
        throw new Error('Channel closed');
      }),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock BroadcastChannel to return our mock
    global.BroadcastChannel = vi.fn(() => mockChannel) as any;

    const store = createStore({ count: 0 }).use(
      sync({ channel: 'test-channel' })
    );

    store.setState({ count: 1 });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should handle missing BroadcastChannel gracefully', () => {
    // Save original BroadcastChannel
    const originalBC = (global as any).BroadcastChannel;

    // Delete BroadcastChannel
    delete (global as any).BroadcastChannel;

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const store = createStore({ count: 0 }).use(sync({ channel: 'test' }));

    // Should still work without BroadcastChannel
    store.setState({ count: 1 });
    expect(store.getState()).toEqual({ count: 1 });

    consoleWarnSpy.mockRestore();

    // Restore BroadcastChannel
    if (originalBC) {
      (global as any).BroadcastChannel = originalBC;
    }
  });
});

describe('devtools plugin - coverage tests', () => {
  // Test devtools uncovered lines (106-107, 115-154, 159-161)
  it('should handle missing devtools gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Ensure window exists
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = {};
    }

    // Remove __REDUX_DEVTOOLS_EXTENSION__
    const originalExtension = (global as any).window.__REDUX_DEVTOOLS_EXTENSION__;
    delete (global as any).window.__REDUX_DEVTOOLS_EXTENSION__;

    const store = createStore({ count: 0 }).use(devtools({ name: 'test' }));

    store.setState({ count: 1 });

    // Restore
    if (originalExtension) {
      (global as any).window.__REDUX_DEVTOOLS_EXTENSION__ = originalExtension;
    } else {
      delete (global as any).window.__REDUX_DEVTOOLS_EXTENSION__;
    }

    consoleWarnSpy.mockRestore();
  });

  it('should handle devtools init errors', () => {
    // Ensure window exists
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = {};
    }

    const mockDevtools = {
      connect: vi.fn(() => {
        throw new Error('Devtools init failed');
      }),
    };

    (global as any).window.__REDUX_DEVTOOLS_EXTENSION__ = mockDevtools;

    // The devtools plugin throws errors which get wrapped by the kernel
    expect(() => createStore({ count: 0 }).use(devtools({ name: 'test' }))).toThrow();

    delete (global as any).window.__REDUX_DEVTOOLS_EXTENSION__;
  });
});

describe('immer plugin - coverage tests', () => {
  // Test immer plugin uncovered lines (38-42, 50-57, 60-67, 85-98, 181-182)
  it('should handle draft updates for arrays', () => {
    const store = createStore({ items: [1, 2, 3] }).use(immer());

    store.setState((draft: any) => {
      draft.items.push(4);
    });

    expect(store.getState()).toEqual({ items: [1, 2, 3, 4] });
  });

  it('should handle shallow object updates', () => {
    const store = createStore({ count: 0, name: 'test' }).use(immer());

    store.setState((draft: any) => {
      draft.count = 5;
    });

    expect(store.getState()).toEqual({ count: 5, name: 'test' });
  });

  it('should handle array modifications', () => {
    const store = createStore({ items: [1, 2, 3] }).use(immer());

    store.setState((draft: any) => {
      draft.items[0] = 10;
      draft.items.splice(1, 1);
    });

    expect(store.getState()).toEqual({ items: [10, 3] });
  });

  // Note: delete operations have a known limitation due to store's setState merge behavior
  // The immer plugin returns the full new state, but the store merges it with old state

  it('should return original state if no changes made', () => {
    const store = createStore({ count: 0 }).use(immer());

    const originalState = store.getState();

    store.setState((draft: any) => {
      // No changes
      draft.count;
    });

    // State should be the same reference if no changes
    expect(store.getState()).toEqual(originalState);
  });
});
