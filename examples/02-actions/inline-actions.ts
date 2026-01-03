/**
 * Inline actions example.
 *
 * Demonstrates:
 * - Defining actions within state object (with $ prefix)
 * - Actions receive current state
 */

import { createStore } from '@oxog/state';

// Create store with inline actions (prefix with $)
const counterStore = createStore({
  count: 0,
  // Actions are functions starting with $
  $increment: (state: { count: number }) => ({
    count: state.count + 1,
  }),
  $decrement: (state: { count: number }) => ({
    count: state.count - 1,
  }),
  $incrementBy: (state: { count: number }, amount: number) => ({
    count: state.count + amount,
  }),
});

// Actions are automatically available on the store
console.log(counterStore.getState()); // { count: 0 }

counterStore.increment();
console.log(counterStore.getState()); // { count: 1 }

counterStore.incrementBy(5);
console.log(counterStore.getState()); // { count: 6 }

counterStore.decrement();
console.log(counterStore.getState()); // { count: 5 }
