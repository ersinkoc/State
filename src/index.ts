/**
 * @oxog/state - Zero-dependency reactive state management for any framework
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { createStore, useStore } from '@oxog/state';
 *
 * // Create a store
 * const store = createStore({
 *   count: 0,
 *   user: null,
 *   increment: (state) => ({ count: state.count + 1 }),
 * });
 *
 * // Use in React
 * function Counter() {
 *   const count = useStore(store, (s) => s.count);
 *   const increment = useStore(store, (s) => s.increment);
 *   return <button onClick={increment}>{count}</button>;
 * }
 *
 * // Use in vanilla JS
 * store.subscribe((state) => console.log(state.count));
 * ```
 *
 * @module @oxog/state
 */

// Core
export { createStore, batch, StoreError, StoreErrorCode } from './store.js';
export type { Store, StoreBuilder, StoreOptions } from './store.js';

// React
export { useStore, useCreateStore, useAction } from './react.js';

// Plugins
export {
  persist,
  devtools,
  history,
  sync,
  immer,
  selector,
  sessionStorage,
  createStorage,
  hasHistory,
  triggerSync,
  produce,
} from './plugins/index.js';

// Types
export type {
  Action,
  Actions,
  DeepPartial,
  EqualityFn,
  Listener,
  Plugin,
  Selector,
  StorageLike,
  StoreError as StoreErrorClass,
} from './types.js';

// Utilities
export {
  deepClone,
  deepEqual,
  shallowEqual,
  deepMerge,
  isFunction,
  pick,
  omit,
  identity,
} from './utils/index.js';

// Plugin types
export type {
  PersistOptions,
  DevtoolsOptions,
  HistoryOptions,
  SyncOptions,
  SelectorOptions,
  HistoryStore,
} from './plugins/types.js';
