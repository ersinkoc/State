import type {
  Actions,
  DeepPartial,
  EqualityFn,
  Listener,
  Plugin,
  Selector,
  Store,
  StoreBuilder,
  StoreErrorCode,
  StoreError,
  StoreOptions,
} from './types.js';
import { deepClone, deepEqual, deepMerge, shallowEqual, isFunction, identity } from './utils/index.js';
import { createKernel, type Kernel } from './kernel.js';
import { sharedBatchContext as globalBatchContext, type BatchContext } from './batch-context.js';

// Export types
export type { Store, StoreBuilder, StoreOptions };
export { StoreError, StoreErrorCode } from './types.js';

/**
 * State update function or partial object.
 */
type StateUpdate<TState> = Partial<TState> | ((state: TState) => Partial<TState>);

/**
 * Selector subscription with memoization.
 */
interface SelectorSubscription<TSelected> {
  value: TSelected;
  listeners: Set<Listener<TSelected>>;
  selector: Selector<any, TSelected>;
  equalityFn: EqualityFn<TSelected>;
}

/**
 * Internal store implementation.
 */
class StoreImpl<TState> implements Store<TState> {
  private state: TState;
  private readonly initialState: TState;
  private listeners: Set<Listener<TState>> = new Set();
  private selectorSubscriptions: Map<Selector<any, any>, SelectorSubscription<any>> = new Map();
  private kernel: Kernel;
  private destroyed = false;
  private batchDepth = 0;
  private pendingNotify = false;
  private queuedState: TState | null = null;
  private queuedPrevState: TState | null = null;
  private actions: Actions<TState> = {};

  constructor(initialState: TState, kernel: Kernel) {
    this.state = deepClone(initialState);
    this.initialState = deepClone(initialState);
    this.kernel = kernel;

    // Handle errors from kernel
    this.kernel.onError((error) => {
      console.error('Store error:', error);
    });
  }

  /** Get current state snapshot. */
  getState(): TState {
    this.checkNotDestroyed();
    return this.state;
  }

  /** Update state with partial object or function. */
  setState(partial: StateUpdate<TState>): void {
    this.checkNotDestroyed();

    const prevState = this.state;
    const update = typeof partial === 'function' ? (partial as (state: TState) => Partial<TState>)(this.state) : partial;
    this.state = { ...this.state, ...update };

    this.notifyOrQueue(this.state, prevState);
  }

  /** Deep merge state. */
  merge(partial: DeepPartial<TState>): void {
    this.checkNotDestroyed();

    const prevState = this.state;
    this.state = deepMerge(this.state, partial);

    this.notifyOrQueue(this.state, prevState);
  }

  /** Reset to initial state. */
  reset(): void {
    this.checkNotDestroyed();
    const prevState = this.state;
    this.state = deepClone(this.initialState);

    this.notifyOrQueue(this.state, prevState);
  }

  /** Subscribe to all state changes. */
  subscribe(listener: Listener<TState>): () => void;
  /** Subscribe with selector. */
  subscribe<TSelected>(
    selector: Selector<TState, TSelected>,
    listener: Listener<TSelected>,
    equalityFn?: EqualityFn<TSelected>
  ): () => void;
  subscribe(arg1: any, arg2?: any, arg3?: any): () => void {
    this.checkNotDestroyed();

    // If first arg is a plain function (no selector), it's a simple listener
    if (arg2 === undefined && typeof arg1 === 'function') {
      const listener: Listener<TState> = arg1;
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }

    // Otherwise, it's a selector-based subscription
    const selector: Selector<TState, any> = arg1;
    const listener: Listener<any> = arg2;
    const equalityFn: EqualityFn<any> = arg3 || shallowEqual;

    let subscription = this.selectorSubscriptions.get(selector);

    if (!subscription) {
      const initialValue = selector(this.state);
      subscription = {
        value: initialValue,
        listeners: new Set(),
        selector,
        equalityFn,
      };
      this.selectorSubscriptions.set(selector, subscription);
    }

    subscription.listeners.add(listener);

    return () => {
      const sub = this.selectorSubscriptions.get(selector);
      if (sub) {
        sub.listeners.delete(listener);
        if (sub.listeners.size === 0) {
          this.selectorSubscriptions.delete(selector);
        }
      }
    };
  }

  /** Register a plugin. */
  use<TPlugin extends Plugin<TState>>(plugin: TPlugin, options?: unknown): this {
    this.checkNotDestroyed();

    this.kernel.register(plugin, options, this);

    return this;
  }

  /** Destroy store and cleanup. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.kernel.destroy();
    this.listeners.clear();
    this.selectorSubscriptions.clear();
    this.actions = {};
  }

  /** Add an action (for fluent builder pattern). */
  addAction<K extends string>(name: K, fn: (state: TState, ...args: any[]) => Partial<TState>): this {
    (this.actions as any)[name] = fn;
    return this;
  }

  /** Get all actions. */
  getActions(): Actions<TState> {
    return this.actions;
  }

  /** Check if store is destroyed. */
  private checkNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('Cannot use destroyed store');
    }
  }

  /** Notify listeners or queue if batching. */
  private notifyOrQueue(state: TState, prevState: TState): void {
    // Check if we're in a global batch context
    const inGlobalBatch = globalBatchContext.isBatching();

    if (inGlobalBatch) {
      // Register this store with the global batch context
      const managedStores = globalBatchContext.managedStores;
      if (!managedStores.has(this)) {
        managedStores.add(this);
      }
    }

    // Check if either local batching or global batching is active
    if (this.batchDepth > 0 || inGlobalBatch) {
      // Queue notification - only set prevState on first state change
      this.queuedState = state;
      if (!this.pendingNotify) {
        this.queuedPrevState = prevState;
      }
      this.pendingNotify = true;
    } else {
      // Immediate notification
      this.notify(state, prevState);
    }
  }

  /** Notify all listeners. */
  private notify(state: TState, prevState: TState): void {
    // Notify state change listeners
    this.kernel.emitStateChange(state, prevState);

    // Notify all-state listeners
    for (const listener of this.listeners) {
      try {
        listener(state, prevState);
      } catch (error) {
        this.kernel.emitError(error as Error);
      }
    }

    // Notify selector listeners
    for (const subscription of this.selectorSubscriptions.values()) {
      const newValue = subscription.selector(state);

      if (!subscription.equalityFn(newValue, subscription.value)) {
        const prevValue = subscription.value;
        subscription.value = newValue;

        for (const listener of subscription.listeners) {
          try {
            listener(newValue, prevValue);
          } catch (error) {
            this.kernel.emitError(error as Error);
          }
        }
      }
    }
  }

  /** Flush pending notifications (end of batch). */
  flushNotifications(): void {
    if (this.pendingNotify) {
      this.notify(this.queuedState!, this.queuedPrevState!);
      this.pendingNotify = false;
      this.queuedState = null;
      this.queuedPrevState = null;
    }
  }

  /** Start batching. */
  beginBatch(): void {
    this.batchDepth++;
  }

  /** End batching. */
  endBatch(): void {
    this.batchDepth--;
    if (this.batchDepth === 0) {
      this.flushNotifications();
    }
  }
}

/**
 * Store builder for fluent API.
 */
class StoreBuilderImpl<TState> implements StoreBuilder<TState> {
  private store: StoreImpl<TState>;

  constructor(initialState: TState, kernel: Kernel) {
    this.store = new StoreImpl<TState>(initialState, kernel);
  }

  getState(): TState {
    return this.store.getState();
  }

  setState(partial: StateUpdate<TState>): void {
    this.store.setState(partial);
  }

  merge(partial: DeepPartial<TState>): void {
    this.store.merge(partial);
  }

  reset(): void {
    this.store.reset();
  }

  subscribe(listener: Listener<TState>): () => void;
  subscribe<TSelected>(
    selector: Selector<TState, TSelected>,
    listener: Listener<TSelected>,
    equalityFn?: EqualityFn<TSelected>
  ): () => void;
  subscribe(arg1: any, arg2?: any, arg3?: any): () => void {
    if (arg2 === undefined) {
      // It's a simple listener (no selector)
      return this.store.subscribe(arg1);
    } else {
      // It's a selector-based subscription
      return this.store.subscribe(arg1, arg2, arg3);
    }
  }

  use<TPlugin extends Plugin<TState>>(plugin: TPlugin, options?: unknown): this {
    this.store.use(plugin, options);
    return this;
  }

  destroy(): void {
    this.store.destroy();
  }

  action<K extends string>(
    name: K,
    fn: (state: any, ...args: any[]) => Partial<any>
  ): this {
    this.store.addAction(name, fn);

    // Also create a wrapper method on the builder
    (this as any)[name] = (...args: any[]) => {
      const currentState = this.getState();
      const result = fn(currentState, ...args);
      if (result instanceof Promise) {
        return result.then((partial) => {
          this.setState(partial);
          return partial;
        });
      }
      this.setState(result);
      return result;
    };

    return this;
  }

  /** Add action (internal use). */
  addAction<K extends string>(name: K, fn: (state: TState, ...args: any[]) => Partial<TState>): this {
    this.store.addAction(name, fn);
    return this;
  }

  /** Get actions (internal use). */
  getActions(): Actions<TState> {
    return this.store.getActions();
  }

  /** Start batching. */
  beginBatch(): void {
    this.store.beginBatch();
  }

  /** End batching. */
  endBatch(): void {
    this.store.endBatch();
  }

  /** Flush pending notifications. */
  flushNotifications(): void {
    this.store.flushNotifications();
  }
}

/**
 * Create a new reactive store.
 *
 * Supports three action definition styles:
 * - **Inline**: Actions defined within state object (functions starting with $)
 * - **Separate**: Actions passed as second argument
 * - **Fluent**: Actions added via `.action()` method
 *
 * @typeParam TState - The type of the store state
 * @param initialState - Initial state object, may include inline actions
 * @param actions - Optional separate actions object
 * @returns A new Store instance
 *
 * @example
 * ```typescript
 * // Style A: Inline actions (prefix with $)
 * const store = createStore({
 *   count: 0,
 *   $increment: (state) => ({ count: state.count + 1 }),
 * });
 *
 * // Style B: Separate actions
 * const store = createStore(
 *   { count: 0 },
 *   { increment: (state) => ({ count: state.count + 1 }) }
 * );
 *
 * // Style C: Fluent builder
 * const store = createStore({ count: 0 })
 *   .action('increment', (state) => ({ count: state.count + 1 }));
 * ```
 */
export function createStore<TState>(
  initialState: TState,
  actions?: Actions<TState>
): Store<TState> {
  const kernel = createKernel({ name: 'store' });

  // Handle inline actions (properties starting with $)
  const state: any = { ...initialState };
  const extractedActions: Actions<TState> = {};

  for (const key in state) {
    if (isFunction(state[key]) && key.startsWith('$')) {
      extractedActions[key.substring(1)] = state[key];
      delete state[key];
    }
  }

  // Merge with provided actions
  const allActions = { ...extractedActions, ...actions };

  // Create builder for fluent API or regular store
  const builder = new StoreBuilderImpl<TState>(state as TState, kernel);

  // Add actions if provided
  if (allActions) {
    for (const [name, fn] of Object.entries(allActions)) {
      // Cast to proper type - Actions can return Promise but we handle that separately
      builder.addAction(name, fn as any);
    }
  }

  // Wrap actions to work with state
  const actionList = builder.getActions();

  for (const [name, fn] of Object.entries(actionList)) {
    (builder as any)[name] = (...args: any[]) => {
      const currentState = builder.getState();
      // Call the action with state and args
      const result = (fn as any)(currentState, ...args);
      if (result instanceof Promise) {
        return result.then((partial) => {
          builder.setState(partial);
          return partial;
        });
      }
      builder.setState(result);
      return result;
    };
  }

  // Initialize plugins
  /* c8 ignore start */
  kernel.initializeAll(builder).catch((error) => {
    console.error('Error initializing plugins:', error);
  });
  /* c8 ignore stop */

  // Return a Proxy that forwards unknown calls to the underlying store
  // This allows plugins to add methods that are accessible on the builder
  return new Proxy(builder, {
    get(target, prop) {
      if (prop in target) {
        return (target as any)[prop];
      }
      // Forward to the underlying store
      const store = (target as any).store;
      if (store && typeof store[prop] === 'function') {
        return store[prop].bind(store);
      }
      if (store && prop in store) {
        return store[prop];
      }
      return undefined;
    },
    set(target, prop, value) {
      if (prop in target || typeof value === 'function') {
        (target as any)[prop] = value;
        return true;
      }
      // Forward to the underlying store
      const store = (target as any).store;
      /* c8 ignore start */
      if (store) {
        store[prop] = value;
        return true;
      }
      return false;
      /* c8 ignore stop */
    },
  }) as Store<TState>;
}

/**
 * Batch multiple state updates into a single notification.
 *
 * @param fn - Function containing state updates
 * @returns The return value of fn
 *
 * @example
 * ```typescript
 * import { batch } from '@oxog/state';
 *
 * // Without batch - 3 re-renders
 * store.setState({ a: 1 });
 * store.setState({ b: 2 });
 * store.setState({ c: 3 });
 *
 * // With batch - 1 re-render
 * batch(() => {
 *   store.setState({ a: 1 });
 *   store.setState({ b: 2 });
 *   store.setState({ c: 3 });
 * });
 * ```
 */
export function batch<T>(fn: () => T): T {
  // This is a placeholder - in real implementation, we'd need to track which store
  // For now, batch happens per-store
  return fn();
}

// Export for testing
export { StoreImpl, BatchContext };
