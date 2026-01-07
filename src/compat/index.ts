/**
 * Compatibility layers for middleware patterns.
 *
 * @module compat
 */

export {
  toMiddlewareApi,
  middlewareCompat,
  createWithMiddleware,
  createSimpleMiddleware,
  compose,
  // Legacy aliases (deprecated)
  toZustandApi,
  zustandCompat,
  createWithZustand,
  createMiddleware,
  composeMiddleware,
} from './middleware.js';

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
  // Legacy aliases (deprecated)
  ZustandSetState,
  ZustandGetState,
  ZustandSubscribe,
  ZustandStoreApi,
  ZustandStateCreator,
  ZustandMiddleware,
  ExtractState,
  ZustandSelector,
  ZustandEqualityFn,
} from './middleware.js';
