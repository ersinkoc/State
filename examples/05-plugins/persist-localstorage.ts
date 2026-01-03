/**
 * Persist plugin example.
 *
 * Demonstrates:
 * - Persisting state to localStorage
 * - State hydration on page load
 * - Whitelist/blacklist options
 */

import { createStore, persist } from '@oxog/state';

// Create store with persistence
const store = createStore({
  count: 0,
  user: null,
  temp: '', // Won't be persisted
}).use(
  persist({
    key: 'my-app',
    storage: localStorage,
    blacklist: ['temp'], // Don't persist temp field
  })
);

// State is automatically loaded from localStorage on creation
console.log('Initial state:', store.getState());

// Update state - automatically persisted
store.setState({ count: 5 });

// Reload page and count will still be 5

// With whitelist
const whitelistStore = createStore({
  count: 0,
  user: null,
  temp: '',
}).use(
  persist({
    key: 'my-app-2',
    whitelist: ['count'], // Only persist count
  })
);
