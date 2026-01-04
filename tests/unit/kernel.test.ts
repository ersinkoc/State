/**
 * Tests for kernel implementation.
 */

import { describe, it, expect, vi } from 'vitest';
import { createKernel, Kernel } from '../../src/kernel.js';
import type { Plugin, Store } from '../../src/types.js';

describe('Kernel', () => {
  it('should create a kernel', () => {
    const kernel = createKernel();
    expect(kernel).toBeDefined();
    expect(kernel.plugins).toBeInstanceOf(Map);
  });

  it('should register a plugin', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
    };

    kernel.register(plugin, undefined, mockStore);

    expect(kernel.plugins.has('test')).toBe(true);
    expect(plugin.install).toHaveBeenCalledWith(mockStore, undefined);
  });

  it('should throw on duplicate plugin', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
    };

    kernel.register(plugin, undefined, mockStore);

    expect(() => kernel.register(plugin, undefined, mockStore)).toThrow('already registered');
  });

  it('should check plugin dependencies', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const pluginWithDep: Plugin = {
      name: 'dependent',
      version: '1.0.0',
      dependencies: ['missing'],
      install: vi.fn(),
    };

    expect(() => kernel.register(pluginWithDep, undefined, mockStore)).toThrow('requires');
  });

  it('should throw on invalid plugin', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const invalidPlugin = {} as Plugin;

    expect(() => kernel.register(invalidPlugin, undefined, mockStore)).toThrow('Invalid plugin');
  });

  it('should emit state change events', () => {
    const kernel = createKernel();
    const listener = vi.fn();

    kernel.on('stateChange', listener);

    kernel.emitStateChange({ count: 1 }, { count: 0 });

    expect(listener).toHaveBeenCalledWith({ state: { count: 1 }, prevState: { count: 0 } });
  });

  it('should emit error events', () => {
    const kernel = createKernel();
    const listener = vi.fn();

    kernel.on('error', listener);

    const error = new Error('Test error');
    kernel.emitError(error);

    expect(listener).toHaveBeenCalledWith(error);
  });

  it('should call plugin onStateChange', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const onStateChange = vi.fn();
    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onStateChange,
    };

    kernel.register(plugin, undefined, mockStore);
    kernel.emitStateChange({ count: 1 }, { count: 0 });

    expect(onStateChange).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });

  it('should call plugin onError', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const onError = vi.fn();
    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onError,
    };

    kernel.register(plugin, undefined, mockStore);

    const error = new Error('Test error');
    kernel.emitError(error);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should unregister a plugin', async () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const onDestroy = vi.fn(async () => {});
    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onDestroy,
    };

    kernel.register(plugin, undefined, mockStore);
    await kernel.unregister('test');

    expect(kernel.plugins.has('test')).toBe(false);
    expect(onDestroy).toHaveBeenCalled();
  });

  it('should initialize all plugins', async () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const onInit1 = vi.fn(async () => {});
    const onInit2 = vi.fn(async () => {});

    const plugin1: Plugin = {
      name: 'plugin1',
      version: '1.0.0',
      install: vi.fn(),
      onInit: onInit1,
    };

    const plugin2: Plugin = {
      name: 'plugin2',
      version: '1.0.0',
      install: vi.fn(),
      onInit: onInit2,
    };

    kernel.register(plugin1, undefined, mockStore);
    kernel.register(plugin2, undefined, mockStore);

    await kernel.initializeAll(mockStore);

    expect(onInit1).toHaveBeenCalledWith(mockStore);
    expect(onInit2).toHaveBeenCalledWith(mockStore);
  });

  it('should destroy kernel', async () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const onDestroy = vi.fn(async () => {});
    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onDestroy,
    };

    kernel.register(plugin, undefined, mockStore);
    await kernel.destroy();

    expect(kernel.plugins.size).toBe(0);
    expect(onDestroy).toHaveBeenCalled();
  });

  it('should handle plugin errors gracefully', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;

    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: () => {
        throw new Error('Install error');
      },
    };

    expect(() => kernel.register(plugin, undefined, mockStore)).toThrow('Install error');
  });
});

describe('Kernel - coverage tests', () => {
  // Test lines 36-37: unsubscribe when listeners.get(event) is undefined
  it('should handle unsubscribe when event has no listeners', () => {
    const kernel = createKernel();
    const unsubscribe = kernel.on('customEvent', () => {});

    // After unsubscribe, the event should have no listeners
    unsubscribe();

    // Calling unsubscribe again should not throw
    expect(() => unsubscribe()).not.toThrow();
  });

  // Test lines 53-54: EventBus error handling
  it('should handle event handler errors in EventBus', () => {
    const kernel = createKernel();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    kernel.on('testEvent', () => {
      throw new Error('Handler error');
    });

    kernel.eventBus.emit('testEvent', {});

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // Test lines 168-169: onInit error handling
  it('should handle onInit errors gracefully', async () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onInit: async () => {
        throw new Error('Init error');
      },
    };

    kernel.register(plugin, undefined, mockStore);

    // Should not throw, just log error
    await kernel.initializeAll(mockStore);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // Test lines 180-181: unregister non-existent plugin
  it('should handle unregister of non-existent plugin', async () => {
    const kernel = createKernel();

    // Should not throw
    await kernel.unregister('non-existent');

    expect(kernel.plugins.size).toBe(0);
  });

  // Test lines 187-188: onDestroy error handling
  it('should handle onDestroy errors gracefully', async () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onDestroy: async () => {
        throw new Error('Destroy error');
      },
    };

    kernel.register(plugin, undefined, mockStore);

    // Should not throw, just log error
    await kernel.unregister('test');

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(kernel.plugins.has('test')).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  // Test lines 208-209: onStateChange error handling
  it('should handle onStateChange errors gracefully', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onStateChange: () => {
        throw new Error('StateChange error');
      },
    };

    kernel.register(plugin, undefined, mockStore);

    // Should not throw, just log error
    kernel.emitStateChange({ count: 1 }, { count: 0 });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // Test lines 227-228: plugin onError error handling
  it('should handle plugin onError errors gracefully', () => {
    const kernel = createKernel();
    const mockStore = {} as Store<any>;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const plugin: Plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
      onError: () => {
        throw new Error('Error handler error');
      },
    };

    kernel.register(plugin, undefined, mockStore);

    const error = new Error('Test error');

    // Should not throw, just log error
    kernel.emitError(error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // Test lines 236-237: error handler error handling
  it('should handle error handler errors gracefully', () => {
    const kernel = createKernel();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const badHandler = () => {
      throw new Error('Bad handler error');
    };

    kernel.onError(badHandler);

    const error = new Error('Test error');

    // Should not throw, just log error
    kernel.emitError(error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  // Test line 250-251: onError return function
  it('should return unsubscribe function from onError', () => {
    const kernel = createKernel();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const unsubscribe = kernel.onError(handler1);

    expect(typeof unsubscribe).toBe('function');

    // Add second error handler
    kernel.onError(handler2);
    expect(kernel.errorHandlers.size).toBe(2);

    // Remove first handler
    unsubscribe();
    expect(kernel.errorHandlers.size).toBe(1);
  });

  // Test EventBus cleanup
  it('should cleanup EventBus listeners', () => {
    const kernel = createKernel();
    const handler = vi.fn();

    kernel.on('testEvent', handler);
    kernel.eventBus.emit('testEvent', {});

    expect(handler).toHaveBeenCalledTimes(1);

    // Destroy kernel
    kernel.destroy();

    // Listeners should be cleared
    expect(kernel.eventBus.listeners.size).toBe(0);
  });
});
