/**
 * Vanilla JS DOM updates example.
 *
 * Demonstrates:
 * - Using store with vanilla JavaScript
 * - Updating DOM on state changes
 * - Multiple subscriptions
 */

import { createStore } from '@oxog/state';

// Create a store
const store = createStore({
  count: 0,
  $increment: (s) => ({ count: s.count + 1 }),
  $decrement: (s) => ({ count: s.count - 1 }),
});

// Get DOM elements
const countElement = document.getElementById('count')!;
const incrementButton = document.getElementById('increment')!;
const decrementButton = document.getElementById('decrement')!;

// Subscribe to state changes and update DOM
store.subscribe((state) => {
  countElement.textContent = state.count.toString();
});

// Add event listeners
incrementButton.addEventListener('click', () => {
  store.increment();
});

decrementButton.addEventListener('click', () => {
  store.decrement();
});

// HTML:
// <div>
//   <span id="count">0</span>
//   <button id="increment">+</button>
//   <button id="decrement">-</button>
// </div>
