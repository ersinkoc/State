import type { Plugin, Store } from './types.js';

/**
 * Plugin instance with runtime state.
 */
interface PluginInstance<TState = unknown> {
  plugin: Plugin<TState>;
  options: unknown;
}

/**
 * Event handler type.
 */
type EventHandler = (data: unknown) => void;

/**
 * Event bus for inter-plugin communication.
 */
class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event.
   *
   * @param event - Event name
   * @param handler - Event handler
   * @returns Unsubscribe function
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  /**
   * Emit an event to all subscribers.
   *
   * @param event - Event name
   * @param data - Event data
   */
  emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      }
    }
  }

  /** Clear all listeners. */
  destroy(): void {
    this.listeners.clear();
  }
}

/**
 * Kernel configuration.
 */
interface KernelConfig {
  name?: string;
  devtools?: boolean;
}

/**
 * Kernel managing plugins and events.
 */
export class Kernel {
  plugins: Map<string, PluginInstance<any>> = new Map();
  eventBus: EventBus = new EventBus();
  config: KernelConfig;
  errorHandlers: Set<(error: Error) => void> = new Set();
  private initializing = false;

  constructor(config?: KernelConfig) {
    this.config = config || {};
  }

  /**
   * Register a plugin.
   *
   * @param plugin - The plugin to register
   * @param options - Plugin options
   * @param store - The store instance
   * @throws {Error} If plugin already registered or dependencies missing
   */
  register<TState>(
    plugin: Plugin<TState>,
    options: unknown,
    store: Store<TState>
  ): void {
    // Validate plugin
    if (!plugin.name || !plugin.version || typeof plugin.install !== 'function') {
      throw new Error('Invalid plugin: must have name, version, and install function');
    }

    // Check for duplicate
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin '${plugin.name}' requires '${dep}' to be registered first`
          );
        }
      }
    }

    // Create plugin instance
    const instance: PluginInstance<TState> = {
      plugin,
      options,
    };

    // Install plugin
    try {
      plugin.install(store, options);
    } catch (error) {
      throw new Error(`Failed to install plugin '${plugin.name}': ${error}`);
    }

    this.plugins.set(plugin.name, instance);

    // If not in init phase and plugin has onInit, call it
    if (!this.initializing && plugin.onInit) {
      this.runOnInit(plugin, store);
    }
  }

  /**
   * Initialize all plugins.
   *
   * @param store - The store instance
   */
  async initializeAll<TState>(store: Store<TState>): Promise<void> {
    this.initializing = true;

    const plugins = Array.from(this.plugins.values());

    for (const { plugin } of plugins) {
      if (plugin.onInit) {
        await this.runOnInit(plugin, store);
      }
    }

    this.initializing = false;
  }

  /**
   * Run plugin's onInit safely.
   */
  private async runOnInit<TState>(plugin: Plugin<TState>, store: Store<TState>): Promise<void> {
    try {
      await plugin.onInit!(store);
    } catch (error) {
      console.error(`Error in ${plugin.name} onInit:`, error);
    }
  }

  /**
   * Unregister a plugin.
   *
   * @param name - Plugin name
   */
  async unregister(name: string): Promise<void> {
    const instance = this.plugins.get(name);
    if (!instance) {
      return;
    }

    if (instance.plugin.onDestroy) {
      try {
        await instance.plugin.onDestroy();
      } catch (error) {
        console.error(`Error in ${name} onDestroy:`, error);
      }
    }

    this.plugins.delete(name);
  }

  /**
   * Emit a state change event.
   *
   * @param state - New state
   * @param prevState - Previous state
   */
  emitStateChange<TState>(state: TState, prevState: TState): void {
    this.eventBus.emit('stateChange', { state, prevState });

    for (const { plugin } of this.plugins.values()) {
      if (plugin.onStateChange) {
        try {
          plugin.onStateChange(state, prevState);
        } catch (error) {
          console.error(`Error in ${plugin.name} onStateChange:`, error);
        }
      }
    }
  }

  /**
   * Emit an error event.
   *
   * @param error - The error
   */
  emitError(error: Error): void {
    this.eventBus.emit('error', error);

    for (const { plugin } of this.plugins.values()) {
      if (plugin.onError) {
        try {
          plugin.onError(error);
        } catch (err) {
          console.error(`Error in ${plugin.name} onError:`, err);
        }
      }
    }

    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    }
  }

  /**
   * Add an error handler.
   *
   * @param handler - Error handler function
   * @returns Unsubscribe function
   */
  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to an event.
   *
   * @param event - Event name
   * @param handler - Event handler
   * @returns Unsubscribe function
   */
  on(event: string, handler: EventHandler): () => void {
    return this.eventBus.on(event, handler);
  }

  /** Destroy the kernel and cleanup. */
  async destroy(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys());

    for (const name of pluginNames) {
      await this.unregister(name);
    }

    this.eventBus.destroy();
    this.errorHandlers.clear();
  }
}

/**
 * Create a new kernel.
 *
 * @param config - Kernel configuration
 * @returns A new Kernel instance
 */
export function createKernel(config?: KernelConfig): Kernel {
  return new Kernel(config);
}
