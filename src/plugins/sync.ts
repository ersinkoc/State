/**
 * Sync plugin - Cross-tab state synchronization.
 *
 * Synchronizes state across browser tabs using BroadcastChannel API.
 *
 * @example
 * ```typescript
 * import { createStore, sync } from '@oxog/state';
 *
 * const store = createStore({ count: 0 })
 *   .use(sync({ channel: 'my-app-state' }));
 *
 * // State changes will sync across all tabs
 * ```
 */

// Global type declarations
declare const BroadcastChannel: {
  prototype: BroadcastChannel;
  new (name: string): BroadcastChannel;
} | undefined;

interface MessageEvent {
  data: any;
  type: string;
  target: EventTarget | null;
  srcElement: EventTarget | null;
  currentTarget: EventTarget | null;
  bubbles: boolean;
  cancelable: boolean;
}

interface BroadcastChannel {
  name: string;
  postMessage(message: any): void;
  close(): void;
  onmessage: ((event: MessageEvent) => void) | null;
  onmessageerror: ((event: MessageEvent) => void) | null;
  addEventListener(
    type: 'message' | 'messageerror',
    listener: (event: MessageEvent) => void
  ): void;
  removeEventListener(
    type: 'message' | 'messageerror',
    listener: (event: MessageEvent) => void
  ): void;
}

import type { Plugin, Store } from '../types.js';
import type { SyncOptions } from './types.js';

/**
 * Create a sync plugin.
 *
 * @param options - Plugin options
 * @returns A sync plugin
 *
 * @example
 * ```typescript
 * import { sync } from '@oxog/state';
 *
 * // Default channel name
 * const store = createStore({ count: 0 })
 *   .use(sync());
 *
 * // Custom channel name
 * const store = createStore({ count: 0 })
 *   .use(sync({ channel: 'my-app' }));
 * ```
 */
export function sync<TState>(options: SyncOptions = {}): Plugin<TState> {
  const { channel = 'oxog-state' } = options;
  let broadcastChannel: BroadcastChannel | null = null;
  let currentStore: Store<TState> | null = null;
  let isLocalUpdate = false;

  return {
    name: 'sync',
    version: '1.0.0',
    install(store: Store<TState>) {
      currentStore = store;

      // Check if BroadcastChannel is available
      if (typeof BroadcastChannel === 'undefined') {
        console.warn('BroadcastChannel is not supported in this environment');
        return;
      }

      // Create broadcast channel
      broadcastChannel = new BroadcastChannel(channel);

      // Listen for messages from other tabs
      broadcastChannel.onmessage = (event: MessageEvent) => {
        if (!isLocalUpdate) {
          try {
            // Apply the remote state update
            store.setState(event.data as any);
          } catch (error) {
            console.error('Error applying sync state:', error);
          }
        }
      };

      // Subscribe to state changes and broadcast
      store.subscribe((state) => {
        if (broadcastChannel && isLocalUpdate) {
          try {
            broadcastChannel.postMessage(state);
          } catch (error) {
            console.error('Error broadcasting state:', error);
          }
        }
      });
    },

    onInit() {
      // Broadcast initial state to other tabs
      if (broadcastChannel && currentStore) {
        isLocalUpdate = true;
        try {
          broadcastChannel.postMessage(currentStore.getState());
        } catch (error) {
          console.error('Error broadcasting initial state:', error);
        }
        isLocalUpdate = false;
      }
    },

    onDestroy() {
      // Close the broadcast channel
      if (broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
      }
      currentStore = null;
    },
  };
}

/**
 * Manually trigger a sync broadcast.
 *
 * @param store - The store to sync
 * @param channel - The channel to broadcast on
 *
 * @example
 * ```typescript
 * import { createStore, sync, triggerSync } from '@oxog/state';
 *
 * const store = createStore({ count: 0 })
 *   .use(sync({ channel: 'my-app' }));
 *
 * // Manually trigger sync
 * triggerSync(store, 'my-app');
 * ```
 */
export function triggerSync<TState>(store: Store<TState>, channel = 'oxog-state'): void {
  if (typeof BroadcastChannel === 'undefined') {
    console.warn('BroadcastChannel is not supported in this environment');
    return;
  }

  const broadcastChannel = new BroadcastChannel(channel);
  broadcastChannel.postMessage(store.getState());
  broadcastChannel.close();
}
