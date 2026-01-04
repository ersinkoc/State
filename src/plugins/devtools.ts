/**
 * Devtools plugin - Redux DevTools integration.
 *
 * Connects to Redux DevTools extension for debugging state changes.
 *
 * @example
 * ```typescript
 * import { createStore, devtools } from '@oxog/state';
 *
 * const store = createStore({ count: 0 })
 *   .use(devtools({ name: 'Counter' }));
 * ```
 */

// Global type declarations
declare const window: {
  __REDUX_DEVTOOLS_EXTENSION__?: DevtoolsExtension;
} | undefined;

import type { Plugin, Store } from '../types.js';
import type { DevtoolsOptions } from './types.js';

/**
 * DevTools connection interface.
 */
interface DevtoolsConnection {
  init(state: unknown): void;
  send(action: unknown, state: unknown): void;
  subscribe(callback: (message: any) => void): void;
}

/**
 * DevTools extension interface.
 */
interface DevtoolsExtension {
  connect(options: { name?: string }): DevtoolsConnection;
}

/**
 * Check if DevTools extension is available.
 */
function hasDevtools(): boolean {
  return typeof window !== 'undefined' && !!window.__REDUX_DEVTOOLS_EXTENSION__;
}

/**
 * Get DevTools extension.
 */
function getDevtools(): DevtoolsExtension | null {
  /* c8 ignore next 2 */
  if (typeof window === 'undefined') return null;
  return window.__REDUX_DEVTOOLS_EXTENSION__ || null;
}

/**
 * Create a DevTools plugin.
 *
 * @param options - Plugin options
 * @returns A DevTools plugin
 *
 * @example
 * ```typescript
 * import { devtools } from '@oxog/state';
 *
 * // Basic usage
 * const store = createStore({ count: 0 })
 *   .use(devtools({ name: 'My Store' }));
 *
 * // Disabled in production
 * const store = createStore({ count: 0 })
 *   .use(devtools({
 *     name: 'My Store',
 *     enabled: process.env.NODE_ENV === 'development'
 *   }));
 * ```
 */
export function devtools<TState>(options: DevtoolsOptions = {}): Plugin<TState> {
  const { name = 'OxogState Store', enabled = true, maxAge = 50 } = options;
  let connection: DevtoolsConnection | null = null;
  let history: { state: TState; action: string }[] = [];

  return {
    name: 'devtools',
    version: '1.0.0',
    install(store: Store<TState>) {
      // Check if DevTools is available
      if (!enabled || !hasDevtools()) {
        return;
      }

      const extension = getDevtools();
      /* c8 ignore next */
      if (!extension) return;

      // Connect to DevTools
      connection = extension.connect({ name });

      // Initialize with current state
      connection.init(store.getState());

      // Subscribe to state changes
      store.subscribe((state, prevState) => {
        /* c8 ignore next */
        if (!connection) return;

        // Add to history
        history.push({ state, action: 'UPDATE' });
        if (history.length > maxAge) {
          history.shift();
        }

        // Send to DevTools
        connection.send({ type: 'UPDATE', prev: prevState }, state);
      });

      // Subscribe to DevTools messages
      connection.subscribe((message: any) => {
        if (message.type === 'DISPATCH' && message.payload) {
          switch (message.payload.type) {
            case 'JUMP_TO_STATE':
            case 'JUMP_TO_ACTION': {
              // Time travel
              const index = message.payload.type === 'JUMP_TO_ACTION'
                ? history.findIndex((h) => h.action === message.payload.action)
                : message.payload.index;

              if (index >= 0 && index < history.length) {
                const entry = history[index];
                if (entry) {
                  store.setState(entry.state as any);
                }
              }
              break;
            }
            case 'COMMIT': {
              // Commit current state
              connection!.init(store.getState());
              history = [];
              break;
            }
            case 'ROLLBACK': {
              // Rollback to previous state
              if (history.length > 1) {
                const previous = history[history.length - 2];
                if (previous) {
                  store.setState(previous.state as any);
                }
              }
              break;
            }
            case 'RESET': {
              // Reset to initial state
              store.reset();
              break;
            }
          }
        }
      });
    },
    onDestroy() {
      // Cleanup connection
      connection = null;
      history = [];
    },
  };
}
