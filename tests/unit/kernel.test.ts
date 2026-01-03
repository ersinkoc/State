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
