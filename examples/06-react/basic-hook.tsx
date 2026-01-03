/**
 * React basic hook example.
 *
 * Demonstrates:
 * - Using useStore hook
 * - Selecting state slices
 * - Calling actions
 */

import { createStore, useStore } from '@oxog/state';

// Create a store
const counterStore = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $decrement: (state) => ({ count: state.count - 1 }),
});

function Counter() {
  // Select specific state
  const count = useStore(counterStore, (s) => s.count);
  const increment = useStore(counterStore, (s) => s.increment);
  const decrement = useStore(counterStore, (s) => s.decrement);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// With custom equality function (useful for objects/arrays)
function UserDisplay() {
  const userStore = createStore({
    user: null as { id: number; name: string } | null,
  });

  const user = useStore(
    userStore,
    (s) => s.user,
    (a, b) => a?.id === b?.id // Only re-render if id changes
  );

  return <div>{user?.name || 'No user'}</div>;
}
