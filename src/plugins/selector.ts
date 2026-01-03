/**
 * Selector plugin - Computed/derived values.
 *
 * Define computed values that automatically update when dependencies change.
 *
 * @example
 * ```typescript
 * import { createStore, selector } from '@oxog/state';
 *
 * const store = createStore({
 *   items: [],
 *   filter: 'all',
 * })
 * .use(selector({
 *   // Computed: filtered items
 *   filteredItems: (state) => {
 *     if (state.filter === 'all') return state.items;
 *     return state.items.filter((item: any) => item.status === state.filter);
 *   },
 *   // Computed: item count
 *   itemCount: (state) => state.items.length,
 * }));
 *
 * // Access computed values
 * const state = store.getState();
 * console.log(state.filteredItems); // Computed value
 * ```
 */

import type { Plugin, Store } from '../types.js';
import type { SelectorOptions } from './types.js';

/**
 * Create a selector plugin for computed values.
 *
 * @param options - Plugin options with selectors
 * @returns A selector plugin
 *
 * @example
 * ```typescript
 * import { selector } from '@oxog/state';
 *
 * const store = createStore({
 *   items: [{ price: 10 }, { price: 20 }],
 *   taxRate: 0.1,
 * })
 * .use(selector({
 *   // Computed total
 *   total: (state) =>
 *     state.items.reduce((sum: number, item: any) => sum + item.price, 0),
 *
 *   // Computed total with tax
 *   totalWithTax: (state) => {
 *     const total = state.items.reduce((sum: number, item: any) => sum + item.price, 0);
 *     return total * (1 + state.taxRate);
 *   },
 * }));
 * ```
 */
export function selector<TState>(options: SelectorOptions<TState>): Plugin<TState> {
  const { selectors } = options;

  return {
    name: 'selector',
    version: '1.0.0',
    install(store: Store<TState>) {
      // Save original getState before overriding
      const originalGetState = store.getState.bind(store);

      // Cache for computed values
      const cache = new Map<string, { value: any; state: any }>();

      // Computed state proxy
      const computedState = new Proxy({} as object, {
        get(_, prop: string) {
          const selectorFn = selectors[prop as keyof TState];

          if (selectorFn) {
            const currentState = originalGetState();
            const cacheKey = prop;

            // Check cache
            const cached = cache.get(cacheKey);
            if (cached && cached.state === currentState) {
              return cached.value;
            }

            // Compute value
            const value = selectorFn(currentState);
            cache.set(cacheKey, { value, state: currentState });
            return value;
          }

          // Return regular state value
          return (originalGetState() as any)[prop];
        },
      }) as TState;

      // Override getState to return computed state proxy
      store.getState = () => computedState;

      // Clear cache on state change
      store.subscribe(() => {
        cache.clear();
      });
    },
  };
}
