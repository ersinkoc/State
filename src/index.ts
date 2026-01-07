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
export {
  useStore,
  useCreateStore,
  useAction,
  useShallow,
  useStoreActions,
  useStoreSelector,
  useTransientSubscribe,
  useSetState,
} from './react.js';

// Enhanced subscription
export {
  subscribeWithOptions,
  createSubscriber,
  subscribeToMany,
  subscribeOnce,
} from './subscribe.js';
export type { SubscribeOptions } from './subscribe.js';

// Computed values
export {
  computed,
  combineComputed,
  memoizeSelector,
} from './computed.js';
export type { Computed, ComputedOptions } from './computed.js';

// Slices pattern
export {
  createSlice,
  combineSlices,
  createNamespacedSlice,
  extendStore,
  resetSlices,
} from './slices.js';
export type {
  SetSlice,
  GetSlice,
  SliceCreator,
  SliceDefinition,
} from './slices.js';

// Store Federation
export {
  createFederation,
  createFederatedSelector,
  createFederatedComputed,
  waitForFederated,
} from './federation.js';
export type {
  StoreState,
  FederatedState,
  FederationListener,
  TransactionFn,
  FederationOptions,
  Federation,
} from './federation.js';

// Plugins
export {
  persist,
  devtools,
  history,
  sync,
  immer,
  selector,
  logger,
  createLogger,
  effects,
  createEffect,
  createSimpleEffect,
  combineEffects,
  createDebouncedEffect,
  validate,
  createValidator,
  combineValidators,
  createFieldValidator,
  createAsyncValidator,
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
export type { LogLevel, LoggerOptions } from './plugins/logger.js';
export type {
  EffectCleanup,
  EffectFn,
  EffectUtils,
  EffectDefinition,
  EffectsOptions,
} from './plugins/effects.js';
export type {
  ValidationError,
  ValidationResult,
  ValidatorFn,
  ValidateOptions,
  ValidationAPI,
  ValidationTiming,
} from './plugins/validate.js';

// Testing utilities
export {
  createMockStorage,
  spyOnStore,
  assertState,
  createTestStore,
  delay,
  flushMicrotasks,
  mockAction,
  snapshot,
  stateDiff,
} from './testing.js';
export type {
  MockStorage,
  StateChange,
  StoreSpy,
  StateAssertion,
  TestStoreOptions,
  TestStore,
  MockedAction,
} from './testing.js';

// Middleware compatibility
export {
  toMiddlewareApi,
  middlewareCompat,
  createWithMiddleware,
  createSimpleMiddleware,
  compose,
} from './compat/index.js';
export type {
  MiddlewareSetState,
  MiddlewareGetState,
  MiddlewareSubscribe,
  MiddlewareStoreApi,
  StateCreatorFn,
  MiddlewareFn,
  ExtractStateType,
  SelectorFn,
  EqualityCheck,
} from './compat/index.js';
