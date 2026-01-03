/**
 * History plugin example.
 *
 * Demonstrates:
 * - Undo/redo functionality
 * - History limits
 * - Checking if undo/redo available
 */

import { createStore, history } from '@oxog/state';

// Create store with history
const store = createStore({
  count: 0,
  text: '',
}).use(history({ limit: 20 }));

// Make some changes
store.setState({ count: 1 });
store.setState({ count: 2 });
store.setState({ count: 3 });

console.log(store.getState()); // { count: 3, text: '' }

// Undo
store.undo();
console.log(store.getState()); // { count: 2, text: '' }

store.undo();
console.log(store.getState()); // { count: 1, text: '' }

// Redo
store.redo();
console.log(store.getState()); // { count: 2, text: '' }

// Check if undo/redo available
console.log('Can undo:', store.canUndo()); // true
console.log('Can redo:', store.canRedo()); // true
