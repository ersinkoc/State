# @oxog/state

[![npm version](https://img.shields.io/npm/v/@oxog/state.svg)](https://www.npmjs.com/package/@oxog/state)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@oxog/state)](https://bundlephobia.com/package/@oxog/state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Zero-dependency reactive state management for any framework.

## Features

- **Zero Dependencies** - No runtime dependencies, smaller bundle size
- **Framework Agnostic** - Works with React, Vue, Svelte, or vanilla JS
- **TypeScript Native** - Built with strict mode, full type inference
- **Plugin System** - Extend with persist, devtools, history, sync, immer
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
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
});

// Use in React
function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);

  return <button onClick={increment}>{count}</button>;
}

// Use in vanilla JS
store.subscribe((state) => console.log(state.count));
store.increment();
```

## API Reference

### Core

#### `createStore(initialState, actions?)`

Creates a reactive store.

```typescript
// Inline actions
const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
});

// Separate actions
const store = createStore(
  { count: 0 },
  { increment: (state) => ({ count: state.count + 1 }) }
);
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

## Plugins

### Persist

Persist state to localStorage or custom storage.

```typescript
import { persist } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(persist({ key: 'my-app' }));

// With options
const store = createStore({ count: 0, temp: '' })
  .use(persist({
    key: 'my-app',
    storage: sessionStorage,
    whitelist: ['count'], // Only persist count
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

### Immer

Use mutable syntax for immutable updates.

```typescript
import { immer } from '@oxog/state';

const store = createStore({
  users: [{ id: 1, name: 'John' }],
}).use(immer());

store.setState((draft) => {
  draft.users[0].name = 'Jane';
  draft.users.push({ id: 2, name: 'Bob' });
});
```

### Selector

Add computed/derived values.

```typescript
import { selector } from '@oxog/state';

const store = createStore({
  items: [],
  filter: 'all',
}).use(selector({
  filteredItems: (state) => {
    if (state.filter === 'all') return state.items;
    return state.items.filter((i) => i.status === state.filter);
  },
  itemCount: (state) => state.items.length,
}));
```

## Async Actions

Handle async operations with async actions.

```typescript
const store = createStore({
  data: null,
  loading: false,
  error: null,
  fetch: async (state, url: string) => {
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

await store.fetch('/api/users');
```

## TypeScript

Full TypeScript support with type inference.

```typescript
interface State {
  count: number;
  user: User | null;
}

interface Actions {
  increment: (state: State) => Partial<State>;
  setUser: (state: State, user: User) => Partial<State>;
}

const store = createStore<State, Actions>(
  { count: 0, user: null },
  {
    increment: (s) => ({ count: s.count + 1 }),
    setUser: (s, user) => ({ user }),
  }
);
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
