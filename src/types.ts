/**
 * Deep partial type for nested optional properties.
 *
 * @typeParam T - The type to make partially deep
 *
 * @example
 * ```typescript
 * type User = {
 *   name: string;
 *   profile: { age: number; city: string; };
 * };
 *
 * const partial: DeepPartial<User> = {
 *   name: 'John',
 *   profile: { age: 30 } // city is optional
 * };
 * ```
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Action function that receives state and optional arguments, returning a partial state update.
 *
 * @typeParam TState - The store state type
 * @typeParam TArgs - The action argument types tuple
 *
 * @example
 * ```typescript
 * type CounterAction = Action<{ count: number }, [number: number]>;
 *
 * const incrementBy: CounterAction = (state, amount) => ({
 *   count: state.count + amount
 * });
 * ```
 */
export type Action<TState, TArgs extends unknown[] = []> = (
  state: TState,
  ...args: TArgs
) => Partial<TState> | Promise<Partial<TState>>;

/**
 * Collection of actions indexed by name.
 *
 * @typeParam TState - The store state type
 *
 * @example
 * ```typescript
 * const actions: Actions<{ count: number }> = {
 *   increment: (state) => ({ count: state.count + 1 }),
 *   decrement: (state) => ({ count: state.count - 1 })
 * };
 * ```
 */
export type Actions<TState> = Record<string, Action<TState>>;

/**
 * Selector function to extract a slice of state.
 *
 * @typeParam TState - The store state type
 * @typeParam TSelected - The selected value type
 *
 * @example
 * ```typescript
 * const selectCount: Selector<{ count: number; name: string }, number> =
 *   (state) => state.count;
 * ```
 */
export type Selector<TState, TSelected> = (state: TState) => TSelected;

/**
 * Equality function for comparing two values.
 *
 * @typeParam T - The type to compare
 *
 * @example
 * ```typescript
 * const shallowEquality: EqualityFn<{ a: number }> = (a, b) =>
 *   a.a === b.a;
 * ```
 */
export type EqualityFn<T> = (a: T, b: T) => boolean;

/**
 * Listener function called when state changes.
 *
 * @typeParam TState - The store state type
 *
 * @example
 * ```typescript
 * const listener: Listener<{ count: number }> = (state, prevState) => {
 *   console.log(`Count changed from ${prevState.count} to ${state.count}`);
 * };
 * ```
 */
export type Listener<TState> = (state: TState, prevState: TState) => void;

/**
 * Storage interface for persisting state.
 *
 * @example
 * ```typescript
 * const sessionStorage: StorageLike = {
 *   getItem: (key) => sessionStorage.getItem(key),
 *   setItem: (key, value) => sessionStorage.setItem(key, value),
 *   removeItem: (key) => sessionStorage.removeItem(key)
 * };
 * ```
 */
export interface StorageLike {
  /** Get an item from storage */
  getItem(key: string): string | null;
  /** Set an item in storage */
  setItem(key: string, value: string): void;
  /** Remove an item from storage */
  removeItem(key: string): void;
}

/**
 * Store configuration options.
 *
 * @typeParam TState - The store state type
 *
 * @example
 * ```typescript
 * const options: StoreOptions<{ count: number }> = {
 *   name: 'Counter',
 *   devtools: true
 * };
 * ```
 */
export interface StoreOptions<TState> {
  /** Initial state */
  initialState: TState;
  /** Store name for debugging */
  name?: string;
  /** Enable/disable devtools (default: true in development) */
  devtools?: boolean;
}

/**
 * Plugin interface for extending store functionality.
 *
 * @typeParam TState - The store state type
 *
 * @example
 * ```typescript
 * const loggerPlugin: Plugin<{ count: number }> = {
 *   name: 'logger',
 *   version: '1.0.0',
 *   install(store) {
 *     store.subscribe((state) => console.log('State:', state));
 *   }
 * };
 * ```
 */
export interface Plugin<TState = unknown> {
  /** Unique plugin identifier (kebab-case) */
  name: string;
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  /** Other plugins this plugin depends on */
  dependencies?: string[];
  /**
   * Called when plugin is registered.
   *
   * @param store - The store instance
   * @param options - Plugin-specific options
   */
  install: (store: Store<TState>, options?: unknown) => void;
  /**
   * Called after all plugins are installed.
   *
   * @param store - The store instance
   */
  onInit?: (store: Store<TState>) => void | Promise<void>;
  /**
   * Called when plugin is unregistered.
   */
  onDestroy?: () => void | Promise<void>;
  /**
   * Called on state change.
   *
   * @param state - New state
   * @param prevState - Previous state
   */
  onStateChange?: (state: TState, prevState: TState) => void;
  /**
   * Called on error in store.
   *
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
}

/**
 * Store instance with state management methods.
 *
 * @typeParam TState - The store state type
 *
 * @example
 * ```typescript
 * const store: Store<{ count: number }> = createStore({ count: 0 });
 * const state = store.getState(); // { count: 0 }
 * store.setState({ count: 1 });
 * ```
 */
export interface Store<TState> {
  /** Get current state snapshot */
  getState(): TState;
  /**
   * Update state with partial object or function.
   *
   * @param partial - Partial state or updater function
   *
   * @example
   * ```typescript
   * store.setState({ count: 10 });
   * store.setState((state) => ({ count: state.count + 1 }));
   * ```
   */
  setState(partial: Partial<TState> | ((state: TState) => Partial<TState>)): void;
  /**
   * Deep merge state.
   *
   * @param partial - Partial state to merge
   *
   * @example
   * ```typescript
   * store.merge({ user: { name: 'John' } });
   * ```
   */
  merge(partial: DeepPartial<TState>): void;
  /** Reset to initial state */
  reset(): void;
  /**
   * Subscribe to state changes.
   *
   * @param listener - Function called on state changes
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = store.subscribe((state) => console.log(state));
   * unsubscribe();
   * ```
   */
  subscribe(listener: Listener<TState>): () => void;
  /**
   * Subscribe to state changes with selector.
   *
   * @param selector - Function to extract state slice
   * @param listener - Function called when selected value changes
   * @param equalityFn - Optional custom equality function
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = store.subscribe(
   *   (state) => state.count,
   *   (count) => console.log('Count:', count)
   * );
   * ```
   */
  subscribe<TSelected>(
    selector: Selector<TState, TSelected>,
    listener: Listener<TSelected>,
    equalityFn?: EqualityFn<TSelected>
  ): () => void;
  /**
   * Register a plugin.
   *
   * @param plugin - The plugin to register
   * @param options - Plugin-specific options
   * @returns The store instance for chaining
   *
   * @example
   * ```typescript
   * store.use(persist({ key: 'app' }));
   * ```
   */
  use<TPlugin extends Plugin<TState>>(plugin: TPlugin, options?: unknown): this;
  /** Destroy store and cleanup all resources */
  destroy(): void;
}

/**
 * Store builder interface for fluent API.
 *
 * @typeParam TState - The store state type
 *
 * @example
 * ```typescript
 * createStore({ count: 0 })
 *   .action('increment', (s) => ({ count: s.count + 1 }))
 *   .action('decrement', (s) => ({ count: s.count - 1 }));
 * ```
 */
export interface StoreBuilder<TState> extends Store<TState> {
  /**
   * Add an action to the store.
   *
   * @param name - Action name
   * @param fn - Action function
   * @returns The builder for chaining
   */
  action<K extends string>(
    name: K,
    fn: Action<TState & Record<K, Action<TState>>>
  ): this;
}

/**
 * History-enabled store with undo/redo methods.
 */
export interface HistoryStore<TState> extends Store<TState> {
  /** Undo last state change */
  undo(): void;
  /** Redo last undone state change */
  redo(): void;
}

/**
 * Error codes for store errors.
 */
export enum StoreErrorCode {
  /** Store was destroyed and cannot be used */
  STORE_DESTROYED = 'STORE_DESTROYED',
  /** Plugin with same name already registered */
  PLUGIN_EXISTS = 'PLUGIN_EXISTS',
  /** Required plugin dependency not found */
  PLUGIN_DEPENDENCY_MISSING = 'PLUGIN_DEPENDENCY_MISSING',
  /** Invalid state update argument */
  INVALID_STATE_UPDATE = 'INVALID_STATE_UPDATE',
  /** Action threw an error */
  ACTION_ERROR = 'ACTION_ERROR',
}

/**
 * Store error class.
 */
export class StoreError extends Error {
  constructor(
    public code: StoreErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'StoreError';
  }
}
