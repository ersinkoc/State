/**
 * Effects plugin for managing side effects.
 *
 * Provides a declarative way to handle async operations,
 * API calls, and other side effects in response to state changes.
 *
 * @module plugins/effects
 */

import type { Plugin, Store, Selector, EqualityFn } from '../types.js';
import { shallowEqual } from '../utils/index.js';

/**
 * Effect cleanup function.
 */
export type EffectCleanup = () => void;

/**
 * Effect function that runs when dependencies change.
 */
export type EffectFn<T> = (
  value: T,
  prevValue: T,
  utils: EffectUtils
) => void | EffectCleanup | Promise<void | EffectCleanup>;

/**
 * Utilities available to effects.
 */
export interface EffectUtils {
  /** Get current store state */
  getState: () => unknown;
  /** Set store state */
  setState: (partial: any) => void;
  /** Check if effect is still active (not cancelled) */
  isActive: () => boolean;
  /** Cancel this effect */
  cancel: () => void;
  /** Run a callback only if effect is active */
  onlyIfActive: <T>(fn: () => T) => T | undefined;
}

/**
 * Effect definition for the effects plugin.
 */
export interface EffectDefinition<TState, TSelected = TState> {
  /** Selector to watch */
  selector: Selector<TState, TSelected>;
  /** Effect function */
  effect: EffectFn<TSelected>;
  /** Custom equality function */
  equalityFn?: EqualityFn<TSelected>;
  /** Fire effect immediately with current value */
  fireImmediately?: boolean;
  /** Debounce effect (ms) */
  debounce?: number;
  /** Effect name for debugging */
  name?: string;
}

/**
 * Options for the effects plugin.
 */
export interface EffectsOptions<TState> {
  /** Array of effect definitions */
  effects: EffectDefinition<TState, any>[];
  /** Error handler for effect errors */
  onError?: (error: Error, effectName?: string) => void;
}

/**
 * Create a debounced function.
 */
function createDebounced<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Create an effects plugin.
 *
 * @param options - Effects configuration
 * @returns An effects plugin
 *
 * @example
 * ```typescript
 * import { createStore, effects } from '@oxog/state';
 *
 * const store = createStore({
 *   userId: null,
 *   user: null,
 *   loading: false,
 * }).use(effects({
 *   effects: [
 *     {
 *       name: 'fetchUser',
 *       selector: (s) => s.userId,
 *       effect: async (userId, _prev, { setState, isActive }) => {
 *         if (!userId) return;
 *
 *         setState({ loading: true });
 *         try {
 *           const user = await fetchUser(userId);
 *           if (isActive()) {
 *             setState({ user, loading: false });
 *           }
 *         } catch (error) {
 *           if (isActive()) {
 *             setState({ user: null, loading: false });
 *           }
 *         }
 *       },
 *     },
 *   ],
 * }));
 * ```
 */
export function effects<TState>(options: EffectsOptions<TState>): Plugin<TState> {
  const { effects: effectDefs, onError } = options;

  return {
    name: 'effects',
    version: '1.0.0',

    install(store: Store<TState>) {
      const cleanups: (() => void)[] = [];
      const effectCleanups = new Map<number, EffectCleanup>();

      // Set up each effect
      for (let i = 0; i < effectDefs.length; i++) {
        const def = effectDefs[i];
        if (!def) continue;

        const {
          selector,
          effect,
          equalityFn = shallowEqual,
          fireImmediately = false,
          debounce,
          name,
        } = def;

        let isActive = true;
        let prevValue: any = selector(store.getState());

        // Create effect utilities
        const createUtils = (): EffectUtils => ({
          getState: () => store.getState(),
          setState: (partial) => store.setState(partial),
          isActive: () => isActive,
          cancel: () => {
            isActive = false;
          },
          onlyIfActive: <T>(fn: () => T): T | undefined => {
            if (isActive) {
              return fn();
            }
            return undefined;
          },
        });

        // Run effect function
        const runEffect = async (value: any, prev: any) => {
          // Clean up previous effect if any
          const prevCleanup = effectCleanups.get(i);
          if (prevCleanup) {
            try {
              prevCleanup();
            } catch (e) {
              // Ignore cleanup errors
            }
            effectCleanups.delete(i);
          }

          // Reset active flag
          isActive = true;

          try {
            const result = effect(value, prev, createUtils());

            // Handle async effects
            if (result instanceof Promise) {
              const cleanup = await result;
              if (cleanup && isActive) {
                effectCleanups.set(i, cleanup);
              }
            } else if (result) {
              effectCleanups.set(i, result);
            }
          } catch (error) {
            if (onError) {
              onError(error as Error, name);
            } else {
              console.error(`Effect error${name ? ` in '${name}'` : ''}:`, error);
            }
          }
        };

        // Wrap with debounce if needed
        const effectFn = debounce && debounce > 0
          ? createDebounced(runEffect, debounce)
          : runEffect;

        // Fire immediately if requested
        if (fireImmediately) {
          effectFn(prevValue, prevValue);
        }

        // Subscribe to changes
        const unsubscribe = store.subscribe(
          selector,
          (value, prev) => {
            if (!equalityFn(value, prev)) {
              prevValue = value;
              effectFn(value, prev);
            }
          },
          equalityFn
        );

        // Track cleanup
        cleanups.push(() => {
          unsubscribe();
          isActive = false;

          // Cancel debounced function
          if ('cancel' in effectFn) {
            (effectFn as any).cancel();
          }

          // Run cleanup
          const cleanup = effectCleanups.get(i);
          if (cleanup) {
            try {
              cleanup();
            } catch {
              // Ignore
            }
          }
        });
      }

      // Store cleanup function for onDestroy
      (store as any).__effectsCleanup = () => {
        for (const cleanup of cleanups) {
          cleanup();
        }
        effectCleanups.clear();
      };
    },

  };
}

/**
 * Create an effect definition helper.
 *
 * @param name - Effect name
 * @param selector - Selector to watch
 * @param effect - Effect function
 * @param options - Additional options
 * @returns Effect definition
 *
 * @example
 * ```typescript
 * const fetchUserEffect = createEffect(
 *   'fetchUser',
 *   (s) => s.userId,
 *   async (userId, _prev, { setState }) => {
 *     const user = await api.getUser(userId);
 *     setState({ user });
 *   },
 *   { fireImmediately: true }
 * );
 *
 * const store = createStore({ userId: null, user: null })
 *   .use(effects({ effects: [fetchUserEffect] }));
 * ```
 */
export function createEffect<TState, TSelected>(
  name: string,
  selector: Selector<TState, TSelected>,
  effect: EffectFn<TSelected>,
  options: Omit<EffectDefinition<TState, TSelected>, 'name' | 'selector' | 'effect'> = {}
): EffectDefinition<TState, TSelected> {
  return {
    name,
    selector,
    effect,
    ...options,
  };
}

/**
 * Create a simple effect that runs on any state change.
 *
 * @param effect - Effect function
 * @param options - Effect options
 * @returns Effect definition
 *
 * @example
 * ```typescript
 * const logEffect = createSimpleEffect(
 *   (state, prevState) => {
 *     console.log('State changed:', state);
 *   }
 * );
 * ```
 */
export function createSimpleEffect<TState>(
  effect: (state: TState, prevState: TState, utils: EffectUtils) => void | EffectCleanup,
  options: Omit<EffectDefinition<TState, TState>, 'selector' | 'effect'> = {}
): EffectDefinition<TState, TState> {
  return {
    selector: (s) => s,
    effect,
    equalityFn: () => false, // Always run
    ...options,
  };
}

/**
 * Combine multiple effect definitions.
 *
 * @param effectDefs - Effect definitions to combine
 * @returns Combined effects options
 *
 * @example
 * ```typescript
 * const store = createStore({ ... })
 *   .use(effects(combineEffects(
 *     fetchUserEffect,
 *     saveToStorageEffect,
 *     analyticsEffect,
 *   )));
 * ```
 */
export function combineEffects<TState>(
  ...effectDefs: EffectDefinition<TState, any>[]
): EffectsOptions<TState> {
  return {
    effects: effectDefs,
  };
}

/**
 * Create a debounced effect that only fires after a delay.
 *
 * @param delay - Debounce delay in ms
 * @param selector - Selector to watch
 * @param effect - Effect function
 * @returns Effect definition
 *
 * @example
 * ```typescript
 * const searchEffect = createDebouncedEffect(
 *   300,
 *   (s) => s.searchQuery,
 *   async (query, _prev, { setState }) => {
 *     const results = await api.search(query);
 *     setState({ searchResults: results });
 *   }
 * );
 * ```
 */
export function createDebouncedEffect<TState, TSelected>(
  delay: number,
  selector: Selector<TState, TSelected>,
  effect: EffectFn<TSelected>,
  options: Omit<EffectDefinition<TState, TSelected>, 'selector' | 'effect' | 'debounce'> = {}
): EffectDefinition<TState, TSelected> {
  return {
    selector,
    effect,
    debounce: delay,
    ...options,
  };
}
