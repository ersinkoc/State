# @oxog/state

> Zero-dependency reactive state management for any framework

[![npm version](https://badge.fury.io/js/%40oxog%2Fstate.svg)](https://www.npmjs.com/package/@oxog/state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, framework-agnostic state management library with micro-kernel architecture. Provides reactive state with plugin extensibility, supporting React, Vue, Svelte, and vanilla JavaScript.

## Features

- **Zero Dependencies** - No runtime dependencies means smaller bundle size
- **Framework Agnostic** - Works with React, Vue, Svelte, or vanilla JavaScript
- **TypeScript Native** - Built with TypeScript strict mode
- **Plugin System** - Extend functionality with plugins (persist, devtools, history, etc.)
- **Tiny Bundle** - Less than 2KB gzipped for core

## Quick Start

```bash
npm install @oxog/state
```

```typescript
import { createStore, useStore } from '@oxog/state';

// Create a store
const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
});

// React
function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);
  return <button onClick={increment}>{count}</button>;
}

// Vanilla JS
store.subscribe((state) => console.log(state.count));
```

## Documentation

Full documentation is available at [https://state.oxog.dev](https://state.oxog.dev)

## License

MIT © Ersin Koç
