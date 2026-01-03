# @oxog/state - Zero-Dependency NPM Package

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/state` |
| **GitHub Repository** | `https://github.com/ersinkoc/state` |
| **Documentation Site** | `https://state.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

> **NO social media, Discord, email, or external links allowed.**

---

## Package Description

**One-line:** Zero-dependency reactive state management for any framework

A lightweight, framework-agnostic state management library with micro-kernel architecture. Provides reactive state with plugin extensibility, supporting React, Vue, Svelte, and vanilla JavaScript. Features include computed values, async actions, persistence, devtools integration, and cross-tab synchronization - all with zero runtime dependencies.

---

## NON-NEGOTIABLE RULES

These rules are **ABSOLUTE** and must be followed without exception.

### 1. ZERO RUNTIME DEPENDENCIES

```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```

- Implement EVERYTHING from scratch
- No lodash, no axios, no moment - nothing
- Write your own utilities, parsers, validators
- If you think you need a dependency, you don't

**Allowed devDependencies only:**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0",
    "react": "^18.0.0",
    "@types/react": "^18.0.0"
  }
}
```

### 2. 100% TEST COVERAGE

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- **All tests must pass** (100% success rate)
- Use Vitest for testing
- Coverage thresholds enforced in config

### 3. MICRO-KERNEL ARCHITECTURE

All packages MUST use plugin-based architecture:

```
┌─────────────────────────────────────────────────┐
│          useStore() / getState() / subscribe() │
├─────────────────────────────────────────────────┤
│               Plugin Registry                    │
│          use() · register() · unregister()      │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│ selector│ persist │devtools │ history │  sync   │
│  plugin │ plugin  │ plugin  │ plugin  │ plugin  │
├─────────┴─────────┴─────────┴─────────┴─────────┤
│                 State Kernel                     │
│  createStore · setState · getState · subscribe  │
│  reset · merge · destroy · batch                │
└─────────────────────────────────────────────────┘
```

**Kernel responsibilities (minimal):**
- Plugin registration and lifecycle
- Event bus for inter-plugin communication
- Error boundary and recovery
- Configuration management

### 4. DEVELOPMENT WORKFLOW

Create these documents **FIRST**, before any code:

1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions  
3. **TASKS.md** - Ordered task list with dependencies

Only after all three documents are complete, implement code following TASKS.md sequentially.

### 5. TYPESCRIPT STRICT MODE

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### 6. LLM-NATIVE DESIGN

Package must be designed for both humans AND AI assistants:

- **llms.txt** file in root (< 2000 tokens)
- **Predictable API** naming (`create`, `get`, `set`, `use`, `remove`)
- **Rich JSDoc** with @example on every public API
- **15+ examples** organized by category
- **README** optimized for LLM consumption

### 7. NO EXTERNAL LINKS

- ✅ GitHub repository URL
- ✅ Custom domain (state.oxog.dev)
- ✅ npm package URL
- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## CORE FEATURES

### 1. createStore - Store Creation

Create a reactive store with initial state and optional actions.

**API Example:**
```typescript
import { createStore } from '@oxog/state';

// Style A: Inline actions (Zustand-style)
const counterStore = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
});

// Style B: Separate state and actions
const todoStore = createStore(
  { todos: [], filter: 'all' },
  {
    addTodo: (state, text: string) => ({
      todos: [...state.todos, { id: Date.now(), text, done: false }],
    }),
    toggle: (state, id: number) => ({
      todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t),
    }),
  }
);

// Style C: Fluent builder
const userStore = createStore({ user: null, loading: false })
  .action('setUser', (state, user: User) => ({ user, loading: false }))
  .action('setLoading', (state, loading: boolean) => ({ loading }));
```

### 2. State Operations

Core methods for reading and writing state.

**API Example:**
```typescript
// Get current state
const state = store.getState();

// Set state (partial update)
store.setState({ count: 10 });

// Merge state (deep merge)
store.merge({ user: { name: 'John' } });

// Reset to initial state
store.reset();

// Destroy store and cleanup
store.destroy();
```

### 3. Subscriptions

Subscribe to state changes with optional selector.

**API Example:**
```typescript
// Subscribe to all changes
const unsubscribe = store.subscribe((state, prevState) => {
  console.log('State changed:', state);
});

// Subscribe with selector (only fires when selected value changes)
const unsubscribe = store.subscribe(
  (state) => state.count,
  (count, prevCount) => console.log('Count changed:', count)
);

// Unsubscribe
unsubscribe();
```

### 4. Computed Values (Derived State)

Define computed values that auto-update when dependencies change.

**API Example:**
```typescript
const store = createStore({
  items: [],
  filter: 'all',
  
  // Computed - automatically memoized
  total: (state) => state.items.reduce((sum, item) => sum + item.price, 0),
  
  // Computed with filter
  filteredItems: (state) => {
    if (state.filter === 'all') return state.items;
    return state.items.filter(item => item.status === state.filter);
  },
  
  // Computed count
  itemCount: (state) => state.items.length,
});
```

### 5. Async Actions

Async actions are automatically detected and handled.

**API Example:**
```typescript
const store = createStore({
  user: null,
  loading: false,
  error: null,
  
  // Async action - automatically detected
  fetchUser: async (state, id: string) => {
    // Return partial state for loading
    store.setState({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      return { user, loading: false };
    } catch (error) {
      return { error: error.message, loading: false };
    }
  },
});

// Usage
await store.getState().fetchUser('123');
```

### 6. Plugin System

Extend store functionality with plugins.

**API Example:**
```typescript
import { createStore, persist, devtools, history } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(persist({ key: 'counter', storage: localStorage }))
  .use(devtools({ name: 'Counter Store' }))
  .use(history({ limit: 50 }));

// Plugin-added methods
store.undo();  // from history plugin
store.redo();  // from history plugin
```

### 7. React Integration

Built-in React hook with selector support.

**API Example:**
```typescript
import { createStore, useStore } from '@oxog/state';

const store = createStore({
  count: 0,
  user: null,
  increment: (state) => ({ count: state.count + 1 }),
});

function Counter() {
  // Select specific state
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);
  
  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}

function User() {
  // Select with equality check
  const user = useStore(store, (s) => s.user, (a, b) => a?.id === b?.id);
  
  return <div>{user?.name}</div>;
}
```

### 8. Batch Updates

Batch multiple updates into a single re-render.

**API Example:**
```typescript
import { batch } from '@oxog/state';

// Without batch - 3 re-renders
store.setState({ a: 1 });
store.setState({ b: 2 });
store.setState({ c: 3 });

// With batch - 1 re-render
batch(() => {
  store.setState({ a: 1 });
  store.setState({ b: 2 });
  store.setState({ c: 3 });
});
```

---

## PLUGIN SYSTEM

### Plugin Interface

```typescript
/**
 * Plugin interface for extending store functionality.
 * 
 * @typeParam TState - Store state type
 */
export interface Plugin<TState = unknown> {
  /** Unique plugin identifier (kebab-case) */
  name: string;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Other plugins this plugin depends on */
  dependencies?: string[];
  
  /**
   * Called when plugin is registered.
   * @param store - The store instance
   * @param options - Plugin-specific options
   */
  install: (store: Store<TState>, options?: unknown) => void;
  
  /**
   * Called after all plugins are installed.
   * @param store - The store instance
   */
  onInit?: (store: Store<TState>) => void | Promise<void>;
  
  /**
   * Called when plugin is unregistered.
   */
  onDestroy?: () => void | Promise<void>;
  
  /**
   * Called on state change.
   * @param state - New state
   * @param prevState - Previous state
   */
  onStateChange?: (state: TState, prevState: TState) => void;
  
  /**
   * Called on error in store.
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
}
```

### Core Plugins (Always Available)

| Plugin | Description |
|--------|-------------|
| `selector` | Computed/derived state with automatic memoization |
| `batch` | Batch multiple updates into single notification |

### Optional Plugins (Opt-in)

| Plugin | Description | Enable |
|--------|-------------|--------|
| `persist` | Persist state to storage (localStorage, sessionStorage, AsyncStorage) | `store.use(persist({ key: 'app' }))` |
| `devtools` | Redux DevTools integration for debugging | `store.use(devtools({ name: 'MyStore' }))` |
| `history` | Undo/redo functionality with configurable limit | `store.use(history({ limit: 100 }))` |
| `sync` | Cross-tab state synchronization via BroadcastChannel | `store.use(sync({ channel: 'app-state' }))` |
| `immer` | Immutable updates with mutable syntax (zero-dep implementation) | `store.use(immer())` |

---

## API DESIGN

### Main Export

```typescript
import { 
  // Core
  createStore,
  batch,
  
  // React
  useStore,
  
  // Plugins
  persist,
  devtools,
  history,
  sync,
  immer,
  
  // Types
  type Store,
  type Plugin,
  type StoreOptions,
  type Selector,
} from '@oxog/state';
```

### Type Definitions

```typescript
/**
 * Store configuration options.
 */
export interface StoreOptions<TState> {
  /** Initial state */
  initialState: TState;
  /** Store name for debugging */
  name?: string;
  /** Enable/disable devtools (default: true in development) */
  devtools?: boolean;
}

/**
 * Store instance with state management methods.
 */
export interface Store<TState> {
  /** Get current state snapshot */
  getState(): TState;
  
  /** Update state with partial object */
  setState(partial: Partial<TState> | ((state: TState) => Partial<TState>)): void;
  
  /** Deep merge state */
  merge(partial: DeepPartial<TState>): void;
  
  /** Reset to initial state */
  reset(): void;
  
  /** Subscribe to state changes */
  subscribe(listener: (state: TState, prevState: TState) => void): () => void;
  subscribe<T>(
    selector: (state: TState) => T,
    listener: (selected: T, prevSelected: T) => void,
    equalityFn?: (a: T, b: T) => boolean
  ): () => void;
  
  /** Register a plugin */
  use<TPlugin extends Plugin<TState>>(plugin: TPlugin, options?: unknown): this;
  
  /** Destroy store and cleanup all resources */
  destroy(): void;
}

/**
 * Selector function to extract state slice.
 */
export type Selector<TState, TSelected> = (state: TState) => TSelected;

/**
 * Equality function for comparing selected values.
 */
export type EqualityFn<T> = (a: T, b: T) => boolean;

/**
 * Action function that receives state and returns partial update.
 */
export type Action<TState, TArgs extends unknown[] = []> = 
  (state: TState, ...args: TArgs) => Partial<TState> | Promise<Partial<TState>>;
```

---

## TECHNICAL REQUIREMENTS

| Requirement | Value |
|-------------|-------|
| Runtime | Universal (Node.js, Browser, React Native, Edge Workers) |
| Module Format | ESM + CJS + IIFE |
| Node.js Version | >= 18 |
| React Version | >= 18 (useSyncExternalStore) |
| TypeScript Version | >= 5.0 |
| Bundle Size (core) | < 2KB gzipped |
| Bundle Size (all plugins) | < 8KB gzipped |

---

## LLM-NATIVE REQUIREMENTS

### 1. llms.txt File

Create `/llms.txt` in project root (< 2000 tokens):

```markdown
# @oxog/state

> Zero-dependency reactive state management for any framework

## Install

```bash
npm install @oxog/state
```

## Basic Usage

```typescript
import { createStore, useStore } from '@oxog/state';

const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
});

// React
const count = useStore(store, (s) => s.count);

// Vanilla
store.subscribe((state) => console.log(state.count));
```

## API Summary

### Core
- `createStore(state, actions?)` - Create reactive store
- `batch(fn)` - Batch multiple updates

### Store Methods
- `getState()` - Get current state
- `setState(partial)` - Update state
- `merge(partial)` - Deep merge state
- `reset()` - Reset to initial
- `subscribe(listener)` - Listen to changes
- `use(plugin)` - Add plugin
- `destroy()` - Cleanup

### React
- `useStore(store, selector?, equalityFn?)` - React hook

### Plugins
- `persist({ key, storage? })` - Persist to storage
- `devtools({ name? })` - Redux DevTools
- `history({ limit? })` - Undo/redo
- `sync({ channel })` - Cross-tab sync
- `immer()` - Mutable syntax

## Common Patterns

### Counter
```typescript
const store = createStore({
  count: 0,
  increment: (s) => ({ count: s.count + 1 }),
  decrement: (s) => ({ count: s.count - 1 }),
});
```

### Async Data
```typescript
const store = createStore({
  data: null,
  loading: false,
  fetch: async (s, url) => {
    store.setState({ loading: true });
    const data = await fetch(url).then(r => r.json());
    return { data, loading: false };
  },
});
```

### With Plugins
```typescript
const store = createStore({ count: 0 })
  .use(persist({ key: 'counter' }))
  .use(devtools({ name: 'Counter' }));
```

## Errors

| Code | Meaning | Solution |
|------|---------|----------|
| `STORE_DESTROYED` | Store was destroyed | Create new store |
| `PLUGIN_EXISTS` | Plugin already registered | Check plugin name |
| `INVALID_STATE` | Invalid state update | Check setState argument |

## Links

- Docs: https://state.oxog.dev
- GitHub: https://github.com/ersinkoc/state
```

### 2. API Naming Standards

Use predictable patterns LLMs can infer:

```typescript
// ✅ GOOD - Predictable
createStore()     // Factory function
getState()        // Read current state
setState()        // Update state
subscribe()       // Listen to changes
use()             // Register plugin
reset()           // Reset to initial
merge()           // Deep merge
destroy()         // Cleanup
batch()           // Group updates

// ❌ BAD - Unpredictable
mk()              // Unclear abbreviation
st()              // Unclear abbreviation
x()               // Meaningless
```

### 3. JSDoc Requirements

Every public API must have:

```typescript
/**
 * Creates a new reactive store with the given initial state and actions.
 * 
 * Supports three action definition styles:
 * - Inline: Actions defined within state object
 * - Separate: Actions passed as second argument
 * - Fluent: Actions added via `.action()` method
 * 
 * @typeParam TState - The type of the store state
 * @param initialState - Initial state object, may include inline actions
 * @param actions - Optional separate actions object
 * @returns A new Store instance
 * 
 * @example
 * ```typescript
 * // Style A: Inline actions
 * const store = createStore({
 *   count: 0,
 *   increment: (state) => ({ count: state.count + 1 }),
 * });
 * 
 * // Style B: Separate actions
 * const store = createStore(
 *   { count: 0 },
 *   { increment: (state) => ({ count: state.count + 1 }) }
 * );
 * 
 * // Style C: Fluent builder
 * const store = createStore({ count: 0 })
 *   .action('increment', (state) => ({ count: state.count + 1 }));
 * ```
 */
export function createStore<TState>(
  initialState: TState,
  actions?: Actions<TState>
): Store<TState>;
```

### 4. Example Organization

```
examples/
├── 01-basic/
│   ├── counter.ts
│   ├── todo-list.ts
│   └── form-state.ts
├── 02-actions/
│   ├── inline-actions.ts
│   ├── separate-actions.ts
│   └── fluent-builder.ts
├── 03-async/
│   ├── data-fetching.ts
│   ├── loading-states.ts
│   └── error-handling.ts
├── 04-computed/
│   ├── derived-values.ts
│   ├── filtered-lists.ts
│   └── aggregations.ts
├── 05-plugins/
│   ├── persist-localstorage.ts
│   ├── devtools-integration.ts
│   ├── undo-redo.ts
│   └── cross-tab-sync.ts
├── 06-react/
│   ├── basic-hook.ts
│   ├── selectors.ts
│   └── multiple-stores.ts
├── 07-vue/
│   ├── composition-api.ts
│   └── reactive-store.ts
├── 08-svelte/
│   ├── svelte-store.ts
│   └── derived-stores.ts
├── 09-vanilla/
│   ├── dom-updates.ts
│   └── event-handling.ts
├── 10-ssr/
│   ├── nextjs-app.ts
│   └── hydration.ts
└── 11-real-world/
    ├── shopping-cart.ts
    ├── auth-state.ts
    ├── theme-manager.ts
    ├── notification-system.ts
    └── multi-step-form.ts
```

---

## PROJECT STRUCTURE

```
state/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Website deploy only
├── src/
│   ├── index.ts                # Main entry - exports everything
│   ├── kernel.ts               # Core state kernel
│   ├── store.ts                # Store implementation
│   ├── types.ts                # Type definitions (JSDoc rich!)
│   ├── batch.ts                # Batch updates
│   ├── react.ts                # React integration (useStore)
│   ├── plugins/
│   │   ├── index.ts            # Plugin exports
│   │   ├── types.ts            # Plugin types
│   │   ├── selector.ts         # Core: computed values
│   │   ├── persist.ts          # Optional: persistence
│   │   ├── devtools.ts         # Optional: Redux DevTools
│   │   ├── history.ts          # Optional: undo/redo
│   │   ├── sync.ts             # Optional: cross-tab sync
│   │   └── immer.ts            # Optional: immutable updates
│   └── utils/
│       ├── deep-equal.ts       # Deep equality check
│       ├── deep-merge.ts       # Deep merge utility
│       ├── shallow-equal.ts    # Shallow equality check
│       └── is-function.ts      # Type guards
├── tests/
│   ├── unit/
│   │   ├── kernel.test.ts
│   │   ├── store.test.ts
│   │   ├── batch.test.ts
│   │   ├── react.test.ts
│   │   └── plugins/
│   │       ├── selector.test.ts
│   │       ├── persist.test.ts
│   │       ├── devtools.test.ts
│   │       ├── history.test.ts
│   │       ├── sync.test.ts
│   │       └── immer.test.ts
│   ├── integration/
│   │   ├── store-plugins.test.ts
│   │   ├── react-integration.test.ts
│   │   └── cross-tab.test.ts
│   └── fixtures/
│       └── test-stores.ts
├── examples/                   # 15+ organized examples (see above)
├── website/                    # React + Vite site → state.oxog.dev
│   ├── public/
│   │   ├── CNAME               # state.oxog.dev
│   │   └── llms.txt            # LLM reference (copied from root)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CodeBlock.tsx   # IDE-style with line numbers
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── Playground.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── GettingStarted.tsx
│   │   │   ├── ApiReference.tsx
│   │   │   ├── Examples.tsx
│   │   │   ├── Plugins.tsx
│   │   │   └── Playground.tsx
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   └── vite.config.ts
├── llms.txt                    # LLM-optimized reference (< 2000 tokens)
├── SPECIFICATION.md            # Package spec (root)
├── IMPLEMENTATION.md           # Architecture design (root)
├── TASKS.md                    # Task breakdown (root)
├── README.md                   # Human + LLM optimized
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── .gitignore
```

---

## WEBSITE REQUIREMENTS

### Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Syntax Highlighting**: Prism React Renderer
- **Icons**: Lucide React
- **Domain**: state.oxog.dev

### IDE-Style Code Blocks

All code blocks MUST have:
- Line numbers (muted, non-selectable)
- Syntax highlighting (TypeScript/JavaScript)
- Header bar with filename/language
- Copy button with "Copied!" feedback
- Rounded corners, subtle border
- Dark/light theme support

### Theme System

- Dark mode (default)
- Light mode
- Toggle button in navbar
- Persist in localStorage
- Respect system preference on first visit

### Required Pages

1. **Home** - Hero, features grid, install command, quick example
2. **Getting Started** - Installation, basic usage, core concepts
3. **API Reference** - Complete documentation of all exports
4. **Examples** - All 15+ examples with live code
5. **Plugins** - Core, optional, and how to create custom plugins
6. **Playground** - Interactive code editor with live preview

### Footer

- "@oxog/state"
- MIT License
- © 2025 Ersin Koç
- GitHub link only

---

## GITHUB ACTIONS

Single workflow file: `.github/workflows/deploy.yml`

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Build package
        run: npm run build
      
      - name: Build website
        working-directory: ./website
        run: |
          npm ci
          npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './website/dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## CONFIG FILES

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig([
  // Main bundle (ESM + CJS)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    external: ['react'],
  },
  // IIFE bundle for CDN
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'OxogState',
    outDir: 'dist/iife',
    minify: true,
    external: ['react'],
  },
]);
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        '*.config.*',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

### package.json

```json
{
  "name": "@oxog/state",
  "version": "1.0.0",
  "description": "Zero-dependency reactive state management for any framework",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:coverage"
  },
  "keywords": [
    "state",
    "state-management",
    "store",
    "reactive",
    "react",
    "hooks",
    "zustand-alternative",
    "redux-alternative",
    "signals",
    "framework-agnostic",
    "typescript",
    "zero-dependency"
  ],
  "author": "Ersin Koç",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ersinkoc/state.git"
  },
  "bugs": {
    "url": "https://github.com/ersinkoc/state/issues"
  },
  "homepage": "https://state.oxog.dev",
  "engines": {
    "node": ">=18"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^9.0.0",
    "jsdom": "^24.0.0",
    "prettier": "^3.0.0",
    "react": "^18.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

---

## IMPLEMENTATION CHECKLIST

### Before Starting
- [ ] Create SPECIFICATION.md with complete spec
- [ ] Create IMPLEMENTATION.md with architecture
- [ ] Create TASKS.md with ordered task list
- [ ] All three documents reviewed and complete

### During Implementation
- [ ] Follow TASKS.md sequentially
- [ ] Write tests before or with each feature
- [ ] Maintain 100% coverage throughout
- [ ] JSDoc on every public API with @example
- [ ] Create examples as features are built

### Package Completion
- [ ] All tests passing (100%)
- [ ] Coverage at 100% (lines, branches, functions)
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Package builds without errors

### LLM-Native Completion
- [ ] llms.txt created (< 2000 tokens)
- [ ] llms.txt copied to website/public/
- [ ] README first 500 tokens optimized
- [ ] All public APIs have JSDoc + @example
- [ ] 15+ examples in organized folders
- [ ] package.json has 12 keywords
- [ ] API uses standard naming patterns

### Website Completion
- [ ] All 6 pages implemented
- [ ] IDE-style code blocks with line numbers
- [ ] Copy buttons working
- [ ] Dark/Light theme toggle
- [ ] CNAME file with state.oxog.dev
- [ ] Mobile responsive
- [ ] Footer with Ersin Koç, MIT, GitHub only

### Final Verification
- [ ] `npm run build` succeeds
- [ ] `npm run test:coverage` shows 100%
- [ ] Website builds without errors
- [ ] All examples run successfully
- [ ] README is complete and accurate

---

## BEGIN IMPLEMENTATION

Start by creating **SPECIFICATION.md** with the complete package specification based on everything above.

Then create **IMPLEMENTATION.md** with architecture decisions.

Then create **TASKS.md** with ordered, numbered tasks.

Only after all three documents are complete, begin implementing code by following TASKS.md sequentially.

**Remember:**
- This package will be published to npm
- It must be production-ready
- Zero runtime dependencies
- 100% test coverage
- Professionally documented
- LLM-native design
- Beautiful documentation website
