/**
 * Plugins for extending @oxog/state functionality.
 *
 * @example
 * ```typescript
 * import {
 *   persist,
 *   devtools,
 *   history,
 *   sync,
 *   immer,
 *   selector,
 *   sessionStorage,
 *   hasHistory
 * } from '@oxog/state';
 *
 * const store = createStore({ count: 0 })
 *   .use(persist({ key: 'app' }))
 *   .use(devtools({ name: 'My Store' }))
 *   .use(history({ limit: 50 }))
 *   .use(sync({ channel: 'app-state' }))
 *   .use(immer())
 *   .use(selector({ selectors: { ... } }));
 * ```
 */

export { persist, sessionStorage, createStorage } from './persist.js';
export { devtools } from './devtools.js';
export { history, hasHistory } from './history.js';
export { sync, triggerSync } from './sync.js';
export { immer, produce } from './immer.js';
export { selector } from './selector.js';
export { logger, createLogger } from './logger.js';
export type { LogLevel, LoggerOptions } from './logger.js';
export {
  effects,
  createEffect,
  createSimpleEffect,
  combineEffects,
  createDebouncedEffect,
} from './effects.js';
export type {
  EffectCleanup,
  EffectFn,
  EffectUtils,
  EffectDefinition,
  EffectsOptions,
} from './effects.js';
export {
  validate,
  createValidator,
  combineValidators,
  createFieldValidator,
  createAsyncValidator,
} from './validate.js';
export type {
  ValidationError,
  ValidationResult,
  ValidatorFn,
  ValidateOptions,
  ValidationAPI,
  ValidationTiming,
} from './validate.js';

// Re-export types
export type {
  PersistOptions,
  StorageLike,
  DevtoolsOptions,
  HistoryOptions,
  SyncOptions,
  SelectorOptions,
  HistoryStore,
} from './types.js';
