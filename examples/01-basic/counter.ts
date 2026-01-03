/**
 * Basic counter example.
 *
 * Demonstrates:
 * - Creating a store
 * - Simple state updates
 * - Subscriptions
 */

import { createStore } from '@oxog/state';

// Create a counter store
const counterStore = createStore({
  count: 0,
});

// Subscribe to changes
const unsubscribe = counterStore.subscribe((state) => {
  console.log('Count:', state.count);
});

// Update state
counterStore.setState({ count: 1 });
// Output: Count: 1

counterStore.setState({ count: 2 });
// Output: Count: 2

// Clean up
unsubscribe();
