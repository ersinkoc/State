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
