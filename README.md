# @oxog/state

[![npm version](https://img.shields.io/npm/v/@oxog/state.svg)](https://www.npmjs.com/package/@oxog/state)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@oxog/state)](https://bundlephobia.com/package/@oxog/state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Zero-dependency reactive state management for any framework.

## Features

- **Zero Dependencies** - No runtime dependencies, smaller bundle size
- **Framework Agnostic** - Works with React, Vue, Svelte, or vanilla JS
- **TypeScript Native** - Built with strict mode, full type inference
- **Plugin System** - Extend with persist, devtools, history, sync, logger, effects, validate
- **Slices & Computed** - Modular state organization with derived values
- **Store Federation** - Combine multiple stores for large applications
- **Tiny Bundle** - Less than 2KB gzipped for core

## Installation

```bash
npm install @oxog/state
```

```bash
yarn add @oxog/state
```

```bash
pnpm add @oxog/state
```

## Quick Start

```typescript
import { createStore, useStore } from '@oxog/state';

// Create a store with state and actions
const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $decrement: (state) => ({ count: state.count - 1 }),
});

// Use in React
function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);

  return <button onClick={increment}>{count}</button>;
}

// Use in vanilla JS
store.subscribe((state) => console.log(state.count));
store.getState().increment();
```

## API Reference

### Core

#### `createStore(initialState)`

Creates a reactive store.

```typescript
const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
});
```

#### `batch(fn)`

Batch multiple updates into a single notification.

```typescript
import { batch } from '@oxog/state';

batch(() => {
  store.setState({ count: 1 });
  store.setState({ name: 'John' });
}); // Single notification
```

### Store Methods

| Method | Description |
|--------|-------------|
| `getState()` | Get current state |
| `setState(partial)` | Update state with partial object |
| `merge(partial)` | Deep merge state |
| `reset()` | Reset to initial state |
| `subscribe(listener, selector?)` | Subscribe to changes |
| `use(plugin, options?)` | Add plugin |
| `destroy()` | Cleanup store |

### React Hooks

#### `useStore(store, selector?, equalityFn?)`

Subscribe to store state in React components.

```typescript
// Full state
const state = useStore(store);

// With selector
const count = useStore(store, (s) => s.count);

// With custom equality
const user = useStore(store, (s) => s.user, deepEqual);
```

#### `useShallow(selector)` <sup>v1.2</sup>

Wrap selectors returning objects to use shallow equality comparison.

```typescript
import { useStore, useShallow } from '@oxog/state';

// Without useShallow - re-renders on any state change
// const data = useStore(store, s => ({ a: s.a, b: s.b }));

// With useShallow - only re-renders when values change
const data = useStore(store, useShallow(s => ({ a: s.a, b: s.b })));
```

#### `useStoreSelector(store, selectors)` <sup>v1.2</sup>

Select multiple values with independent subscriptions.

```typescript
import { useStoreSelector } from '@oxog/state';

const { userCount, totalRevenue } = useStoreSelector(store, {
  userCount: s => s.users.length,
  totalRevenue: s => s.orders.reduce((sum, o) => sum + o.total, 0),
});
```

#### `useStoreActions(store, ...actionNames)` <sup>v1.2</sup>

Get multiple actions with stable references.

```typescript
import { useStoreActions } from '@oxog/state';

const { increment, decrement, reset } = useStoreActions(
  store,
  'increment', 'decrement', 'reset'
);
```

#### `useSetState(store)` <sup>v1.2</sup>

Get a stable setState function for partial updates.

```typescript
import { useSetState } from '@oxog/state';

function Form() {
  const setState = useSetState(store);

  return (
    <input onChange={(e) => setState({ name: e.target.value })} />
  );
}
```

#### `useTransientSubscribe(store, selector, callback)` <sup>v1.2</sup>

Subscribe to state changes without causing re-renders.

```typescript
import { useTransientSubscribe } from '@oxog/state';

function Analytics() {
  useTransientSubscribe(
    store,
    s => s.pageViews,
    (views) => analytics.track('page_view', { count: views })
  );

  return <div>Tracking active</div>;
}
```

#### `useCreateStore(initialState)`

Create a store scoped to component lifecycle.

```typescript
function MyComponent() {
  const store = useCreateStore({ count: 0 });
  // Store is destroyed when component unmounts
}
```

#### `useAction(store, actionName)`

Get a stable action reference.

```typescript
const increment = useAction(store, 'increment');
```

## Patterns <sup>v1.2</sup>

### Slices

Organize state into modular, reusable slices.

```typescript
import { createStore, createSlice } from '@oxog/state';

const userSlice = createSlice('user', {
  name: '',
  email: '',
  $login: (state, name: string, email: string) => ({ name, email }),
  $logout: () => ({ name: '', email: '' }),
});

const cartSlice = createSlice('cart', {
  items: [],
  $addItem: (state, item) => ({ items: [...state.items, item] }),
});

const store = createStore({
  ...userSlice,
  ...cartSlice,
});

// Access: store.getState().user.name
// Action: store.getState().user.login('John', 'john@example.com')
```

### Computed Values

Derive values from state with automatic memoization.

```typescript
import { createStore, computed } from '@oxog/state';

const store = createStore({
  items: [{ price: 10, qty: 2 }, { price: 20, qty: 1 }],

  totalItems: computed((state) =>
    state.items.reduce((sum, i) => sum + i.qty, 0)
  ),

  totalPrice: computed((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  ),
});

console.log(store.getState().totalItems); // 3
console.log(store.getState().totalPrice); // 40
```

### Store Federation

Combine multiple stores into a unified interface.

```typescript
import { createStore, createFederation } from '@oxog/state';

const userStore = createStore({ name: 'John' });
const cartStore = createStore({ items: [] });
const settingsStore = createStore({ theme: 'dark' });

const federation = createFederation({
  user: userStore,
  cart: cartStore,
  settings: settingsStore,
});

// Access all stores
const state = federation.getState();
console.log(state.user.name, state.cart.items, state.settings.theme);

// Subscribe to specific store
federation.subscribeStore('user', (userState) => {
  console.log('User changed:', userState);
});
```

## Plugins

### Persist

Persist state to localStorage with advanced options.

```typescript
import { persist } from '@oxog/state';

const store = createStore({ count: 0, temp: '' })
  .use(persist({
    key: 'my-app',
    storage: localStorage,
    // v1.2.0 options
    version: 1,
    migrate: (state, version) => state,
    partialize: (state) => ({ count: state.count }), // Only persist count
    writeDebounce: 100,
    onRehydrateStorage: (state) => console.log('Hydrated:', state),
  }));
```

### DevTools

Connect to Redux DevTools Extension.

```typescript
import { devtools } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(devtools({ name: 'My Store' }));
```

### History

Add undo/redo functionality.

```typescript
import { history } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(history({ limit: 50 }));

store.setState({ count: 1 });
store.setState({ count: 2 });
store.undo(); // { count: 1 }
store.redo(); // { count: 2 }
```

### Sync

Synchronize state across browser tabs.

```typescript
import { sync } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(sync({ channel: 'my-app' }));
```

### Logger <sup>v1.2</sup>

Development logging with diff, timestamps, and filtering.

```typescript
import { logger } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(logger({
    level: 'debug',
    collapsed: true,
    diff: true,
    timestamp: true,
    filter: (action, state) => state.count > 0,
  }));
```

### Effects <sup>v1.2</sup>

Reactive side effects with debounce and cleanup.

```typescript
import { effects, createEffect } from '@oxog/state';

const store = createStore({
  searchTerm: '',
  results: [],
})
.use(effects({
  search: createEffect(
    (state) => state.searchTerm,
    async (term, { setState, signal }) => {
      const res = await fetch(`/api/search?q=${term}`, { signal });
      const results = await res.json();
      setState({ results });
    },
    { debounce: 300 }
  ),
}));
```

### Validate <sup>v1.2</sup>

Schema-agnostic validation with Zod, Yup, or custom validators.

```typescript
import { validate } from '@oxog/state';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

const store = createStore({ email: '', age: 0 })
  .use(validate({
    schema,
    timing: 'before',
    rejectInvalid: true,
    onError: (errors) => console.error(errors),
  }));
```

## Async Actions

Handle async operations with async actions.

```typescript
const store = createStore({
  data: null,
  loading: false,
  error: null,
  $fetch: async (state, url: string) => {
    store.setState({ loading: true, error: null });
    try {
      const res = await fetch(url);
      const data = await res.json();
      return { data, loading: false };
    } catch (error) {
      return { error, loading: false };
    }
  },
});

await store.getState().fetch('/api/users');
```

## TypeScript

Full TypeScript support with type inference.

```typescript
import { createStore, createSlice, InferSliceState } from '@oxog/state';

// Type inference from slices
const counterSlice = createSlice('counter', {
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
});

type CounterState = InferSliceState<typeof counterSlice>;
// { counter: { count: number } }

// Explicit types
interface State {
  count: number;
  user: User | null;
}

const store = createStore<State>({
  count: 0,
  user: null,
  $increment: (s) => ({ count: s.count + 1 }),
  $setUser: (s, user: User) => ({ user }),
});
```

## Testing <sup>v1.2</sup>

Testing utilities for stores.

```typescript
import { createTestStore, mockStore, getStoreSnapshot } from '@oxog/state/testing';

// Isolated test store
const store = createTestStore({
  count: 0,
  $increment: (s) => ({ count: s.count + 1 }),
});

// Mock store with action tracking
const mock = mockStore({ count: 0, $increment: (s) => ({ count: s.count + 1 }) });
mock.getState().increment();
expect(mock.actionCalls.increment).toBe(1);

// Snapshot testing
const snapshot = getStoreSnapshot(store);
expect(snapshot).toMatchSnapshot();
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Documentation

Full documentation available at [state.oxog.dev](https://state.oxog.dev)

## License

MIT
