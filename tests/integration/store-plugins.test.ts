/**
 * Integration tests for store + plugin interactions.
 */

import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src/store.js';
import { persist, history, devtools } from '../../src/plugins/index.js';

describe('store + persist integration', () => {
  it('should work with history plugin', () => {
    const mockStorage: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    };

    const store = createStore({ count: 0 })
      .use(persist({ key: 'test', storage }))
      .use(history());

    store.setState({ count: 1 });
    store.setState({ count: 2 });

    // Should have history
    expect((store as any).canUndo()).toBe(true);

    // Should persist (versioned format)
    expect(mockStorage['test']).toBe(JSON.stringify({ state: { count: 2 }, version: 0 }));

    // Undo should update storage
    (store as any).undo();
    expect(mockStorage['test']).toBe(JSON.stringify({ state: { count: 1 }, version: 0 }));
  });
});

describe('store + devtools integration', () => {
  it('should work with persist plugin', () => {
    const mockConnection = {
      init: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn(),
    };

    const mockExtension = {
      connect: vi.fn(() => mockConnection),
    };

    (global as any).__REDUX_DEVTOOLS_EXTENSION__ = mockExtension;

    const mockStorage: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    };

    const store = createStore({ count: 0 })
      .use(persist({ key: 'test', storage }))
      .use(devtools());

    expect(mockConnection.init).toHaveBeenCalled();

    store.setState({ count: 1 });

    expect(mockConnection.send).toHaveBeenCalled();

    delete (global as any).__REDUX_DEVTOOLS_EXTENSION__;
  });
});

describe('multiple plugins', () => {
  it('should work with all plugins together', () => {
    const mockConnection = {
      init: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn(),
    };

    const mockExtension = {
      connect: vi.fn(() => mockConnection),
    };

    (global as any).__REDUX_DEVTOOLS_EXTENSION__ = mockExtension;

    const mockStorage: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    };

    const store = createStore({ count: 0 })
      .use(persist({ key: 'test', storage }))
      .use(history())
      .use(devtools());

    // All plugins should be active
    expect(typeof (store as any).undo).toBe('function');
    expect(mockConnection.init).toHaveBeenCalled();

    store.setState({ count: 1 });

    expect(mockStorage['test']).toBe(JSON.stringify({ state: { count: 1 }, version: 0 }));
    expect(mockConnection.send).toHaveBeenCalled();
    expect((store as any).canUndo()).toBe(true);

    delete (global as any).__REDUX_DEVTOOLS_EXTENSION__;
  });
});

describe('plugin lifecycle', () => {
  it('should call onInit after all plugins registered', async () => {
    const order: string[] = [];

    const plugin1 = {
      name: 'plugin1',
      version: '1.0.0',
      install: vi.fn(() => {
        order.push('plugin1-install');
      }),
      onInit: vi.fn(async () => {
        order.push('plugin1-init');
      }),
    };

    const plugin2 = {
      name: 'plugin2',
      version: '1.0.0',
      dependencies: ['plugin1'] as string[],
      install: vi.fn(() => {
        order.push('plugin2-install');
      }),
      onInit: vi.fn(async () => {
        order.push('plugin2-init');
      }),
    };

    createStore({ count: 0 }).use(plugin1).use(plugin2);

    // Wait for async onInit
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(order).toContain('plugin1-init');
    expect(order).toContain('plugin2-init');
  });

  it('should call onDestroy on store destroy', async () => {
    const onDestroy = vi.fn();

    const plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onDestroy: vi.fn(async () => {
        onDestroy();
      }),
    };

    const store = createStore({ count: 0 }).use(plugin);
    store.destroy();

    expect(onDestroy).toHaveBeenCalled();
  });
});
