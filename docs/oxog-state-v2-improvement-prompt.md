# @oxog/state v2.0 - Ultimate State Management Library

## Mission Statement

Transform @oxog/state from a Zustand alternative into the **definitive state management solution** that surpasses all existing libraries in developer experience, performance, and capability while maintaining zero-dependency philosophy and micro-kernel architecture.

---

## Current State Analysis

### What @oxog/state Already Does Well
- Zero runtime dependencies
- Framework-agnostic design (React, Vue, Svelte, Vanilla JS)
- Plugin system with `.use()` chaining
- Built-in plugins: persist, devtools, history, sync, immer, selector
- TypeScript-native with strict mode
- Tiny bundle (~2KB gzipped)
- Clean API with inline actions

### What Competitors (Zustand, Jotai, Valtio) Do That We Don't
1. **subscribeWithSelector** - Selective subscription with equality functions
2. **useShallow** - Shallow equality for multiple state picks
3. **useSyncExternalStore** - React 18 concurrent mode support
4. **Transient updates** - Subscribe without causing re-renders
5. **Slices pattern** - Composable store modules
6. **Middleware TypeScript mutators** - Advanced type inference
7. **getInitialState** - SSR hydration support
8. **Action type naming** - DevTools action labels

---

## Implementation Specification

### Phase 1: Core Engine Enhancements

#### 1.1 Enhanced Subscription System

**File:** `src/core/subscribe.ts`

```typescript
interface SubscribeOptions<T, U = T> {
  /** Custom equality function for comparing selected values */
  equalityFn?: (a: U, b: U) => boolean;
  /** Fire callback immediately with current state */
  fireImmediately?: boolean;
  /** Debounce notifications (ms) */
  debounce?: number;
  /** Throttle notifications (ms) */
  throttle?: number;
  /** Only fire when condition is met */
  when?: (state: T, prevState: T) => boolean;
}

interface EnhancedSubscribe<T> {
  // Basic subscription (existing)
  (listener: (state: T, prevState: T) => void): () => void;
  
  // Selector-based subscription (NEW)
  <U>(
    selector: (state: T) => U,
    listener: (selected: U, prevSelected: U) => void,
    options?: SubscribeOptions<T, U>
  ): () => void;
}
```

**Implementation Requirements:**
- Selector function receives current state, returns derived value
- Listener only fires when selected value changes (based on equalityFn)
- Default equalityFn is `Object.is` (strict equality)
- `fireImmediately: true` calls listener once with current value on subscribe
- `debounce` and `throttle` are mutually exclusive, throw if both provided
- `when` predicate adds conditional notification gating
- Return unsubscribe function as before

**Why This Is Better Than Zustand:**
- Zustand requires `subscribeWithSelector` middleware (extra step)
- We provide `debounce`, `throttle`, `when` - Zustand has none of these
- Single unified API instead of separate middleware

---

#### 1.2 Batch Updates System

**File:** `src/core/batch.ts`

```typescript
interface BatchOptions {
  /** Async batch - waits for promises */
  async?: boolean;
  /** Transaction name for devtools */
  name?: string;
}

function batch(fn: () => void, options?: BatchOptions): void;
function batch<T>(fn: () => Promise<T>, options?: BatchOptions): Promise<T>;
```

**Implementation Requirements:**
- Collect all `setState` calls during batch execution
- Fire single notification at end with accumulated changes
- Support nested batches (only outermost fires notification)
- Async batch waits for all promises before notifying
- Transaction name appears in devtools as single action
- Rollback on error (restore previous state if batch throws)

**Why This Is Better Than Zustand:**
- Zustand has no built-in batch (relies on manual batching)
- Error rollback provides transactional safety
- Async batch support is unique

---

#### 1.3 Computed Values (Derived State)

**File:** `src/core/computed.ts`

```typescript
interface ComputedOptions<T, U> {
  /** Custom equality for caching */
  equals?: (a: U, b: U) => boolean;
  /** Lazy evaluation (only compute when accessed) */
  lazy?: boolean;
  /** Keep last N values in cache */
  cacheSize?: number;
}

function computed<T, U>(
  store: Store<T>,
  selector: (state: T) => U,
  options?: ComputedOptions<T, U>
): () => U;
```

**Implementation Requirements:**
- Memoize computed values based on input state
- Only recompute when dependencies change
- Support multi-level dependency tracking
- `lazy: true` delays computation until first access
- `cacheSize > 1` enables time-travel debugging for computed values
- Computeds can depend on other computeds (DAG resolution)

**Why This Is Better Than Zustand:**
- Zustand has no built-in computed (requires selector plugin or manual)
- Our computed is reactive with dependency tracking
- Cache size option is unique for debugging

---

### Phase 2: React Integration Excellence

#### 2.1 Enhanced useStore Hook

**File:** `src/react/useStore.ts`

```typescript
interface UseStoreOptions<U> {
  /** Custom equality function */
  equalityFn?: (a: U, b: U) => boolean;
  /** Suspend while loading (React Suspense) */
  suspend?: boolean;
  /** Error boundary integration */
  throwOnError?: boolean;
}

function useStore<T>(store: Store<T>): T;
function useStore<T, U>(
  store: Store<T>,
  selector: (state: T) => U,
  options?: UseStoreOptions<U>
): U;
```

**Implementation Requirements:**
- Use `React.useSyncExternalStore` for concurrent mode compatibility
- Use `React.useDebugValue` for DevTools inspection
- Provide `getServerSnapshot` for SSR hydration
- `suspend: true` throws promise for React Suspense
- `throwOnError: true` propagates store errors to error boundaries
- Memoize selector with `useCallback` internally
- Support React 17 fallback (use shim if useSyncExternalStore unavailable)

---

#### 2.2 useShallow Hook

**File:** `src/react/useShallow.ts`

```typescript
function useShallow<T, U extends object>(
  selector: (state: T) => U
): (state: T) => U;
```

**Usage:**
```typescript
const { count, name } = useStore(store, useShallow(s => ({ 
  count: s.count, 
  name: s.name 
})));
```

**Implementation Requirements:**
- Wrap selector with shallow equality comparison
- Support objects, arrays, Maps, Sets
- Use `Object.keys` comparison for objects
- Use index comparison for arrays
- Memoize the wrapper function

---

#### 2.3 useStoreActions Hook

**File:** `src/react/useStoreActions.ts`

```typescript
function useStoreActions<T, K extends keyof T>(
  store: Store<T>,
  ...actionNames: K[]
): Pick<T, K>;
```

**Usage:**
```typescript
const { increment, decrement } = useStoreActions(store, 'increment', 'decrement');
```

**Implementation Requirements:**
- Extract only action functions from store
- Return stable references (no re-render on state change)
- Type-safe: only allows keys that are functions

---

#### 2.4 useStoreSelector Hook (Performance Optimized)

**File:** `src/react/useStoreSelector.ts`

```typescript
function useStoreSelector<T, R>(
  store: Store<T>,
  selectors: { [K in keyof R]: (state: T) => R[K] }
): R;
```

**Usage:**
```typescript
const { doubled, isPositive } = useStoreSelector(store, {
  doubled: s => s.count * 2,
  isPositive: s => s.count > 0
});
```

**Implementation Requirements:**
- Each selector tracked independently
- Only re-render when relevant selector output changes
- More granular than single selector

---

### Phase 3: Advanced Plugin System

#### 3.1 Plugin Lifecycle Hooks

**File:** `src/core/plugin.ts`

```typescript
interface PluginLifecycle<T> {
  /** Called once when plugin is attached */
  onInit?: (store: Store<T>) => void | (() => void);
  
  /** Called before setState */
  onBeforeChange?: (nextState: Partial<T>, prevState: T) => Partial<T> | false;
  
  /** Called after setState */
  onAfterChange?: (state: T, prevState: T, actionName?: string) => void;
  
  /** Called on subscribe */
  onSubscribe?: (listener: Function) => void;
  
  /** Called on unsubscribe */
  onUnsubscribe?: (listener: Function) => void;
  
  /** Called on store.destroy() */
  onDestroy?: () => void;
  
  /** Called on store.reset() */
  onReset?: (initialState: T) => void;
  
  /** Priority order (lower = earlier) */
  priority?: number;
}
```

**Implementation Requirements:**
- `onBeforeChange` can transform state or return `false` to cancel
- Plugin cleanup function from `onInit` called on destroy
- Priority ordering for multiple plugins
- Async lifecycle hooks supported

---

#### 3.2 Enhanced Persist Plugin

**File:** `src/plugins/persist.ts`

```typescript
interface PersistOptions<T> {
  key: string;
  storage?: Storage | AsyncStorage;
  
  /** Partial state persistence */
  partialize?: (state: T) => Partial<T>;
  
  /** Merge strategy for hydration */
  merge?: (persisted: Partial<T>, current: T) => T;
  
  /** Migration between versions */
  version?: number;
  migrate?: (persisted: unknown, version: number) => T;
  
  /** Serialization */
  serialize?: (state: T) => string;
  deserialize?: (str: string) => T;
  
  /** Encryption */
  encrypt?: (data: string) => string;
  decrypt?: (data: string) => string;
  
  /** Debounce writes */
  writeDebounce?: number;
  
  /** Skip persistence for certain keys */
  blacklist?: (keyof T)[];
  whitelist?: (keyof T)[];
  
  /** Callback hooks */
  onRehydrateStorage?: (state: T | undefined) => void;
  onHydrationComplete?: (state: T) => void;
  onPersistError?: (error: Error) => void;
}
```

**Why This Is Better Than Zustand:**
- Encryption support built-in
- Write debouncing prevents excessive I/O
- `onPersistError` callback for error handling
- Combined blacklist/whitelist with partialize

---

#### 3.3 Enhanced DevTools Plugin

**File:** `src/plugins/devtools.ts`

```typescript
interface DevToolsOptions {
  name?: string;
  enabled?: boolean;
  
  /** Action filtering */
  actionsDenylist?: string | RegExp | (string | RegExp)[];
  actionsAllowlist?: string | RegExp | (string | RegExp)[];
  
  /** State sanitization (hide sensitive data) */
  stateSanitizer?: (state: unknown) => unknown;
  actionSanitizer?: (action: unknown) => unknown;
  
  /** Trace options */
  trace?: boolean;
  traceLimit?: number;
  
  /** Features */
  features?: {
    pause?: boolean;
    lock?: boolean;
    persist?: boolean;
    export?: boolean;
    import?: boolean;
    jump?: boolean;
    skip?: boolean;
    reorder?: boolean;
    dispatch?: boolean;
  };
  
  /** Anonymous actions naming */
  anonymousActionType?: string;
  
  /** Maximum actions in history */
  maxAge?: number;
  
  /** Serialize options for non-JSON data */
  serialize?: {
    replacer?: (key: string, value: unknown) => unknown;
    reviver?: (key: string, value: unknown) => unknown;
    immutable?: boolean;
  };
}
```

---

#### 3.4 Enhanced History Plugin (Undo/Redo)

**File:** `src/plugins/history.ts`

```typescript
interface HistoryOptions<T> {
  limit?: number;
  
  /** Group rapid changes into single history entry */
  groupingInterval?: number;
  
  /** Filter which changes create history entries */
  filter?: (state: T, prevState: T) => boolean;
  
  /** Custom diff function for efficient storage */
  diff?: (prev: T, next: T) => unknown;
  apply?: (state: T, diff: unknown) => T;
  
  /** Pause/resume history tracking */
  pauseable?: boolean;
}

interface HistoryAPI<T> {
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
  
  /** Jump to specific point */
  go(index: number): void;
  
  /** Get history entries */
  getHistory(): HistoryEntry<T>[];
  
  /** Pause/resume */
  pause(): void;
  resume(): void;
  isPaused(): boolean;
  
  /** Group multiple changes */
  group(fn: () => void, name?: string): void;
}
```

**Why This Is Better Than Zustand:**
- Zustand has NO built-in history
- Grouping interval prevents spam
- Diff-based storage for efficiency
- Pause/resume for bulk operations

---

#### 3.5 NEW: Middleware Plugin

**File:** `src/plugins/middleware.ts`

Zustand-style middleware compatibility layer:

```typescript
type Middleware<T, Mps extends unknown[] = [], Mcs extends unknown[] = []> = 
  (config: StateCreator<T, Mps, Mcs>) => StateCreator<T, Mps, Mcs>;

function applyMiddleware<T>(
  ...middlewares: Middleware<T>[]
): Plugin<T>;
```

**Usage:**
```typescript
import { zustandCompat } from '@oxog/state/compat';

// Use existing Zustand middlewares!
const store = createStore({ count: 0 })
  .use(zustandCompat(
    someZustandMiddleware({ option: true })
  ));
```

---

#### 3.6 NEW: Validation Plugin

**File:** `src/plugins/validate.ts`

```typescript
interface ValidateOptions<T> {
  /** Zod/Yup/custom schema */
  schema?: ZodSchema<T> | YupSchema<T> | ((state: T) => boolean);
  
  /** Validation timing */
  on?: 'change' | 'commit' | 'manual';
  
  /** Error handling */
  onError?: (errors: ValidationError[]) => void;
  throwOnError?: boolean;
  
  /** Partial validation */
  paths?: (keyof T)[];
}

interface ValidationAPI {
  validate(): ValidationResult;
  isValid(): boolean;
  getErrors(): ValidationError[];
}
```

**Why This Is Better:**
- NO state library has built-in validation
- Schema library agnostic (Zod, Yup, or custom)
- Selective path validation

---

#### 3.7 NEW: Logger Plugin

**File:** `src/plugins/logger.ts`

```typescript
interface LoggerOptions<T> {
  /** Log level */
  level?: 'debug' | 'info' | 'warn' | 'error';
  
  /** Custom logger */
  logger?: typeof console;
  
  /** Formatting */
  collapsed?: boolean;
  diff?: boolean;
  colors?: boolean;
  timestamp?: boolean;
  
  /** Filtering */
  filter?: (action: string, state: T) => boolean;
  
  /** Transformer */
  stateTransformer?: (state: T) => unknown;
  actionTransformer?: (action: string) => string;
}
```

---

#### 3.8 NEW: Effects Plugin (Side Effects Management)

**File:** `src/plugins/effects.ts`

```typescript
interface EffectsOptions<T> {
  effects: {
    [K: string]: {
      /** Trigger condition */
      when: (state: T, prevState: T) => boolean;
      /** Effect to run */
      run: (state: T, context: EffectContext) => void | Promise<void> | (() => void);
      /** Debounce/throttle */
      debounce?: number;
      throttle?: number;
    };
  };
}

interface EffectContext<T> {
  getState: () => T;
  setState: SetState<T>;
  signal: AbortSignal; // For cancellation
}
```

**Usage:**
```typescript
store.use(effects({
  effects: {
    syncToServer: {
      when: (state, prev) => state.items !== prev.items,
      run: async (state, { signal }) => {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(state.items),
          signal
        });
      },
      debounce: 1000
    }
  }
}));
```

**Why This Is Better:**
- Declarative side effect management
- Built-in cancellation (AbortController)
- No external library needed (unlike redux-saga)

---

### Phase 4: Store Composition & Modularity

#### 4.1 Slices Pattern

**File:** `src/core/slices.ts`

```typescript
type SliceCreator<T, S> = (
  set: SetSlice<T>,
  get: () => T,
  store: Store<T>
) => S;

function createSlice<T, S extends Partial<T>>(
  creator: SliceCreator<T, S>
): SliceCreator<T, S>;

function combineSlices<T>(...slices: SliceCreator<T, Partial<T>>[]): T;
```

**Usage:**
```typescript
const createCountSlice = createSlice((set, get) => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 })),
}));

const createUserSlice = createSlice((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const store = createStore(combineSlices(
  createCountSlice,
  createUserSlice
));
```

---

#### 4.2 Store Federation (Multi-Store Communication)

**File:** `src/core/federation.ts`

```typescript
interface Federation<Stores extends Record<string, Store<any>>> {
  stores: Stores;
  
  /** Subscribe to any store change */
  subscribe(listener: (stores: Stores) => void): () => void;
  
  /** Get combined state */
  getState(): { [K in keyof Stores]: StoreState<Stores[K]> };
  
  /** Atomic multi-store update */
  transaction(fn: (stores: Stores) => void): void;
}

function createFederation<S extends Record<string, Store<any>>>(
  stores: S
): Federation<S>;
```

**Usage:**
```typescript
const federation = createFederation({
  cart: cartStore,
  user: userStore,
  products: productsStore
});

// Atomic cross-store update
federation.transaction(({ cart, user }) => {
  cart.clear();
  user.setPoints(user.getState().points + 100);
});
```

---

### Phase 5: Performance Optimizations

#### 5.1 Structural Sharing

**File:** `src/core/structural.ts`

```typescript
function enableStructuralSharing<T>(store: Store<T>): void;
```

**Implementation:**
- Detect unchanged object references
- Reuse previous references when values are equal
- Reduces unnecessary re-renders

---

#### 5.2 Selector Memoization

**File:** `src/core/memoize.ts`

```typescript
interface MemoizeOptions {
  maxSize?: number;
  ttl?: number;
  keyFn?: (...args: unknown[]) => string;
}

function memoizeSelector<T, U>(
  selector: (state: T) => U,
  options?: MemoizeOptions
): (state: T) => U;
```

---

#### 5.3 Proxy-based State Access (Optional)

**File:** `src/core/proxy.ts`

```typescript
function createProxyStore<T>(initialState: T): ProxyStore<T>;
```

**Features:**
- Automatic dependency tracking
- Fine-grained updates (only changed paths trigger updates)
- Opt-in feature (doesn't affect existing API)

---

### Phase 6: TypeScript Excellence

#### 6.1 Enhanced Type Inference

```typescript
// Action return type inference
const store = createStore({
  count: 0,
  // TypeScript knows this returns { count: number }
  increment: (state) => ({ count: state.count + 1 }),
  // Async action type inference
  fetch: async (state, id: string) => {
    const data = await api.get(id);
    return { data }; // Type inferred
  }
});

// store.fetch is typed as (id: string) => Promise<void>
```

---

#### 6.2 Plugin Type Composition

```typescript
// Plugins add types to store
const store = createStore({ count: 0 })
  .use(history({ limit: 50 }))  // Adds undo(), redo(), canUndo(), canRedo()
  .use(persist({ key: 'x' }));   // Adds rehydrate(), clearStorage()

store.undo();        // ✅ TypeScript knows this exists
store.rehydrate();   // ✅ TypeScript knows this exists
store.foo();         // ❌ Error: foo doesn't exist
```

---

#### 6.3 Strict Mode

```typescript
interface StrictModeOptions {
  /** Throw on mutation outside setState */
  immutable?: boolean;
  /** Throw on undefined state access */
  noUndefined?: boolean;
  /** Throw on accessing destroyed store */
  checkDestroyed?: boolean;
}

function createStore<T>(state: T, options?: { strict?: StrictModeOptions }): Store<T>;
```

---

### Phase 7: Testing Utilities

**File:** `src/testing/index.ts`

```typescript
/** Create isolated store for testing */
function createTestStore<T>(store: Store<T>): TestStore<T>;

interface TestStore<T> extends Store<T> {
  /** Get all state changes */
  getStateHistory(): T[];
  
  /** Get all notifications */
  getNotifications(): Array<{ state: T; prevState: T }>;
  
  /** Mock time for debounce/throttle */
  advanceTime(ms: number): void;
  
  /** Reset to initial state */
  reset(): void;
  
  /** Snapshot testing */
  toMatchSnapshot(): void;
}

/** Mock storage for persist testing */
function createMockStorage(): Storage;

/** DevTools spy */
function createDevToolsSpy(): DevToolsSpy;
```

---

### Phase 8: Framework Adapters

#### 8.1 Vue Adapter

**File:** `src/vue/index.ts`

```typescript
function useStore<T>(store: Store<T>): Ref<T>;
function useStore<T, U>(store: Store<T>, selector: (s: T) => U): ComputedRef<U>;
```

#### 8.2 Svelte Adapter

**File:** `src/svelte/index.ts`

```typescript
function toSvelteStore<T>(store: Store<T>): Readable<T>;
function toWritableSvelteStore<T>(store: Store<T>): Writable<T>;
```

#### 8.3 Solid Adapter

**File:** `src/solid/index.ts`

```typescript
function useStore<T>(store: Store<T>): Accessor<T>;
```

---

## File Structure

```
src/
├── core/
│   ├── store.ts           # Main store implementation
│   ├── subscribe.ts       # Enhanced subscription system
│   ├── batch.ts           # Batch updates
│   ├── computed.ts        # Derived state
│   ├── slices.ts          # Store composition
│   ├── federation.ts      # Multi-store communication
│   ├── structural.ts      # Structural sharing
│   ├── memoize.ts         # Selector memoization
│   ├── proxy.ts           # Proxy-based access (optional)
│   └── plugin.ts          # Plugin system
├── plugins/
│   ├── persist.ts
│   ├── devtools.ts
│   ├── history.ts
│   ├── sync.ts
│   ├── immer.ts
│   ├── selector.ts
│   ├── validate.ts        # NEW
│   ├── logger.ts          # NEW
│   ├── effects.ts         # NEW
│   └── middleware.ts      # Zustand compat
├── react/
│   ├── useStore.ts
│   ├── useShallow.ts
│   ├── useStoreActions.ts
│   ├── useStoreSelector.ts
│   └── createContext.ts
├── vue/
│   └── index.ts
├── svelte/
│   └── index.ts
├── solid/
│   └── index.ts
├── testing/
│   └── index.ts
├── compat/
│   └── zustand.ts         # Zustand middleware compatibility
└── index.ts
```

---

## Package Exports

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./react": "./dist/react/index.js",
    "./react/shallow": "./dist/react/useShallow.js",
    "./vue": "./dist/vue/index.js",
    "./svelte": "./dist/svelte/index.js",
    "./solid": "./dist/solid/index.js",
    "./vanilla": "./dist/core/store.js",
    "./plugins/persist": "./dist/plugins/persist.js",
    "./plugins/devtools": "./dist/plugins/devtools.js",
    "./plugins/history": "./dist/plugins/history.js",
    "./plugins/sync": "./dist/plugins/sync.js",
    "./plugins/immer": "./dist/plugins/immer.js",
    "./plugins/validate": "./dist/plugins/validate.js",
    "./plugins/logger": "./dist/plugins/logger.js",
    "./plugins/effects": "./dist/plugins/effects.js",
    "./compat/zustand": "./dist/compat/zustand.js",
    "./testing": "./dist/testing/index.js"
  }
}
```

---

## Migration Notes

### Breaking Changes from v1.x
1. `subscribe(listener)` signature unchanged
2. `subscribe(selector, listener)` is NEW (additive)
3. Plugin lifecycle hooks are opt-in (non-breaking)

### New Features Summary
- Enhanced subscribe with selector, debounce, throttle, when
- Batch updates with rollback
- Built-in computed values
- useShallow, useStoreActions, useStoreSelector hooks
- Validation, Logger, Effects plugins
- Slices pattern and store federation
- Testing utilities
- Zustand middleware compatibility

---

## Success Metrics

After implementation, @oxog/state should:
1. ✅ Pass all Zustand test cases (compatibility)
2. ✅ Smaller bundle than Zustand for equivalent features
3. ✅ Better TypeScript inference (no `as` casts needed)
4. ✅ More features out-of-box (history, sync, validation, effects)
5. ✅ Cleaner API (no curried middleware, just `.use()`)
6. ✅ 100% test coverage
7. ✅ SSR/RSC compatible
8. ✅ React 17 + 18 + 19 compatible

---

## Implementation Priority

### P0 (Must Have for v2.0)
1. Enhanced subscribe with selector
2. useShallow hook
3. useSyncExternalStore integration
4. Slices pattern
5. Enhanced persist with encryption/debounce

### P1 (Should Have)
6. Batch updates
7. Computed values
8. Effects plugin
9. Logger plugin
10. Testing utilities

### P2 (Nice to Have)
11. Validation plugin
12. Store federation
13. Zustand middleware compat
14. Proxy-based store

---

## Notes for Implementation

1. **Zero Dependencies**: All features must be implemented without adding runtime dependencies. Immer plugin should use optional peer dependency pattern.

2. **Tree Shaking**: Every export must be independently importable. No side effects in module initialization.

3. **Bundle Size**: Core store + React hooks should be <3KB gzipped. Each plugin <1KB gzipped.

4. **Browser Support**: ES2020+, no polyfills needed for modern browsers.

5. **Testing**: Use Vitest. Mock React with testing-library.

6. **Documentation**: Every public API needs JSDoc with examples. Generate API docs from types.
