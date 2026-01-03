# @oxog/state - Implementation Design Document

## 1. Architecture Overview

### 1.1 Micro-Kernel Architecture

```
┌─────────────────────────────────────────────────┐
│          Public API Layer                       │
│    createStore · useStore · batch              │
├─────────────────────────────────────────────────┤
│               Store Layer                       │
│  State management · Subscription · Actions     │
├─────────────────────────────────────────────────┤
│               Plugin Registry                   │
│          use() · lifecycle · events            │
├─────────────────────────────────────────────────┤
│                 Kernel Layer                    │
│  Event bus · Error boundary · Config           │
└─────────────────────────────────────────────────┘
```

### 1.2 Design Principles

1. **Zero Dependencies**: All utilities implemented from scratch
2. **Type Safety**: TypeScript strict mode throughout
3. **Immutability**: State is never mutated directly
4. **Plugin First**: Core functionality is also implemented as plugins
5. **Performance**: Minimal overhead, O(1) operations where possible

## 2. Core Implementation

### 2.1 Kernel (kernel.ts)

The kernel is the foundation that manages:
- Plugin registry and lifecycle
- Event bus for inter-plugin communication
- Error boundary
- Configuration

```typescript
interface Kernel {
  plugins: Map<string, PluginInstance>
  eventBus: EventBus
  config: KernelConfig
  errorHandlers: ErrorHandler[]
}

interface PluginInstance {
  plugin: Plugin
  options: unknown
  state: unknown
}

interface EventBus {
  on(event: string, handler: Function): () => void
  emit(event: string, data: unknown): void
  destroy(): void
}
```

**Implementation Decisions:**
- Use `Map` for plugin registry (O(1) lookups)
- Use simple function arrays for event handlers (faster than objects)
- Store plugins in registration order for predictable initialization

### 2.2 Store (store.ts)

The store manages state and subscriptions:

```typescript
class StoreImpl<TState> implements Store<TState> {
  private state: TState
  private initialState: TState
  private listeners: Set<Listener>
  private selectorSubscriptions: Map<Selector, SelectorSubscription>
  private kernel: Kernel
  private destroyed: boolean = false

  constructor(initialState: TState, kernel: Kernel) {
    this.state = deepClone(initialState)
    this.initialState = deepClone(initialState)
    this.kernel = kernel
  }
}
```

**Key Implementation Details:**

1. **State Storage**: Single `state` property holds current state
2. **Listeners**: Use `Set` for automatic deduplication
3. **Selector Subscriptions**: Map selector to memoized value + listeners
4. **Deep Clone**: Custom implementation for immutability

### 2.3 Deep Clone Implementation

Since we can't use libraries like `lodash`, implement a custom deep clone:

```typescript
function deepClone<T>(value: T): T {
  // Primitives return as-is
  if (value === null || typeof value !== 'object') {
    return value
  }

  // Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(deepClone) as T
  }

  // Plain object
  if (value.constructor === Object) {
    const cloned = {} as T
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        cloned[key] = deepClone(value[key])
      }
    }
    return cloned
  }

  // For other objects, return as-is (classes, etc.)
  return value
}
```

### 2.4 Deep Merge Implementation

Custom deep merge for nested state updates:

```typescript
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (source === null || typeof source !== 'object') {
    return source as T
  }

  const output = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = output[key]

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        output[key] = deepMerge(targetValue, sourceValue)
      } else {
        output[key] = deepClone(sourceValue)
      }
    }
  }

  return output
}
```

## 3. Subscription System

### 3.1 Listener Management

```typescript
interface Listener {
  (state: unknown, prevState: unknown): void
}

interface SelectorSubscription {
  value: unknown
  listeners: Set<(value: unknown, prevValue: unknown) => void>
  selector: Selector
  equalityFn?: EqualityFn
}
```

**Implementation Strategy:**
- Store listeners in `Set` for O(1) add/remove
- On state change, iterate listeners and catch errors
- Selector subscriptions maintain last computed value
- Use equality check before notifying selector listeners

### 3.2 Equality Functions

Default equality implementations:

```typescript
// Shallow equality (default)
function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (a === null || b === null) return false

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key) || !Object.is((a as any)[key], (b as any)[key])) {
      return false
    }
  }

  return true
}

// Deep equality
function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (a === null || b === null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false

  if (Array.isArray(a) !== Array.isArray(b)) return false

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual((a as any)[key], (b as any)[key])) return false
  }

  return true
}
```

## 4. Action System

### 4.1 Action Registration

Three styles of action registration:

**Style A: Inline Actions**
- Actions are functions in the initial state object
- Detected by checking if value is function
- Removed from state and registered as actions

**Style B: Separate Actions**
- Passed as second argument to `createStore()`
- Directly registered as actions

**Style C: Fluent Builder**
- Added via `.action(name, fn)` method
- Returns builder for chaining

### 4.2 Action Implementation

```typescript
function createAction<TState>(
  store: Store<TState>,
  fn: Action<TState>
): Action<TState> {
  return async (...args: unknown[]) => {
    const currentState = store.getState()

    try {
      const result = fn(currentState, ...args)

      // Handle async actions
      if (result instanceof Promise) {
        const partial = await result
        store.setState(partial)
        return partial
      }

      // Handle sync actions
      store.setState(result)
      return result
    } catch (error) {
      store.kernel.emit('error', error)
      throw error
    }
  }
}
```

## 5. Plugin System

### 5.1 Plugin Lifecycle

```
User calls store.use(plugin, options)
         ↓
1. Validate plugin (name, version, install)
         ↓
2. Check dependencies are registered
         ↓
3. Call plugin.install(store, options)
         ↓
4. Add to plugin registry
         ↓
5. If all plugins ready, call onInit()
```

### 5.2 Plugin Registry

```typescript
class PluginRegistry {
  private plugins: Map<string, PluginInstance>
  private initializing: boolean = false

  register<TState>(
    plugin: Plugin<TState>,
    options: unknown
  ): void {
    // Validate
    if (!plugin.name || !plugin.version || !plugin.install) {
      throw new Error('Invalid plugin')
    }

    // Check duplicate
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`)
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Missing dependency: ${dep}`)
        }
      }
    }

    // Register
    this.plugins.set(plugin.name, {
      plugin,
      options,
      state: null
    })

    // If we're not in init phase, init this plugin
    if (!this.initializing && plugin.onInit) {
      plugin.onInit(store)
    }
  }

  async initializeAll(store: Store): Promise<void> {
    this.initializing = true
    const plugins = Array.from(this.plugins.values())

    for (const { plugin } of plugins) {
      if (plugin.onInit) {
        await plugin.onInit(store)
      }
    }

    this.initializing = false
  }
}
```

### 5.3 Event Bus

```typescript
class EventBus {
  private listeners: Map<string, Set<Function>>

  on(event: string, handler: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in ${event} handler:`, error)
        }
      }
    }
  }
}
```

## 6. Batch Implementation

### 6.1 Batch Context

```typescript
class BatchContext {
  private batches: Set<Store> = new Set()
  private depth: number = 0

  batch<T>(store: Store, fn: () => T): T {
    this.depth++
    this.batches.add(store)

    try {
      const result = fn()
      this.depth--

      if (this.depth === 0) {
        // Notify all subscribers
        for (const s of this.batches) {
          s.flushNotifications()
        }
        this.batches.clear()
      }

      return result
    } catch (error) {
      this.depth--
      throw error
    }
  }
}
```

### 6.2 Notification Queuing

```typescript
class Store {
  private pendingNotifications: boolean = false
  private queuedState: TState | null = null
  private queuedPrevState: TState | null = null

  setState(partial: Partial<TState>): void {
    const prevState = this.state
    this.state = { ...this.state, ...partial }

    if (isBatching()) {
      // Queue notification
      this.queuedState = this.state
      this.queuedPrevState = prevState
      this.pendingNotifications = true
    } else {
      // Immediate notification
      this.notify(this.state, prevState)
    }
  }

  flushNotifications(): void {
    if (this.pendingNotifications) {
      this.notify(this.queuedState!, this.queuedPrevState!)
      this.pendingNotifications = false
      this.queuedState = null
      this.queuedPrevState = null
    }
  }
}
```

## 7. React Integration

### 7.1 useStore Implementation

```typescript
function useStore<TState, TSelected = TState>(
  store: Store<TState>,
  selector?: (state: TState) => TSelected,
  equalityFn?: EqualityFn<TSelected>
): TSelected {
  // Force update
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  // Get latest store ref
  const storeRef = useRef(store)
  const selectorRef = useRef(selector)
  const equalityFnRef = useRef(equalityFn)

  // Update refs
  storeRef.current = store
  selectorRef.current = selector
  equalityFnRef.current = equalityFn

  // Subscribe
  useEffect(() => {
    const unsubscribe = store.subscribe(
      (state) => (selectorRef.current || identity)(state),
      (value, prevValue) => {
        const eqFn = equalityFnRef.current || shallowEqual
        if (!eqFn(value, prevValue)) {
          forceUpdate()
        }
      }
    )

    return unsubscribe
  }, [store])

  // Return current value
  const currentValue = selector
    ? selector(store.getState())
    : store.getState()

  return currentValue as TSelected
}
```

### 7.2 Server-Side Rendering

For SSR compatibility:
- Detect window object
- Gracefully handle missing browser APIs
- Subscribe only on client
- Return initial state on server

## 8. Plugin Implementations

### 8.1 Selector Plugin (Core)

Computed values with automatic memoization:

```typescript
function selectorPlugin<TState>(selectors: {
  [K in keyof TState]?: (state: TState) => TState[K]
}): Plugin<TState> {
  return {
    name: 'selector',
    version: '1.0.0',
    install(store, options) {
      const computedCache = new Map()

      for (const [key, fn] of Object.entries(selectors)) {
        // Override getter to compute value
        Object.defineProperty(store.getState(), key, {
          get() {
            const currentState = store.getState()
            const cacheKey = JSON.stringify(currentState)

            if (!computedCache.has(cacheKey)) {
              computedCache.set(cacheKey, fn(currentState))
            }

            return computedCache.get(cacheKey)
          }
        })
      }

      // Clear cache on state change
      store.subscribe(() => {
        computedCache.clear()
      })
    }
  }
}
```

### 8.2 Persist Plugin

```typescript
function persistPlugin<TState>(options: {
  key: string
  storage?: StorageLike
  whitelist?: Array<keyof TState>
  blacklist?: Array<keyof TState>
}): Plugin<TState> {
  const storage = options.storage || defaultStorage

  return {
    name: 'persist',
    version: '1.0.0',
    install(store) {
      // Hydrate
      try {
        const saved = storage.getItem(options.key)
        if (saved) {
          const parsed = JSON.parse(saved)
          store.merge(parsed)
        }
      } catch (error) {
        console.error('Failed to hydrate state:', error)
      }

      // Persist on change
      store.subscribe((state) => {
        try {
          let toSave = state

          if (options.whitelist) {
            toSave = pick(state, options.whitelist)
          } else if (options.blacklist) {
            toSave = omit(state, options.blacklist)
          }

          storage.setItem(options.key, JSON.stringify(toSave))
        } catch (error) {
          console.error('Failed to persist state:', error)
        }
      })
    }
  }
}
```

**Storage abstraction:**
```typescript
interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const defaultStorage: StorageLike = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
}

// For SSR
const ssrSafeStorage: StorageLike = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}
```

### 8.3 DevTools Plugin

```typescript
function devtoolsPlugin<TState>(options: {
  name?: string
  enabled?: boolean
} = {}): Plugin<TState> {
  return {
    name: 'devtools',
    version: '1.0.0',
    install(store) {
      if (typeof window === 'undefined') return

      const extension = (window as any).__REDUX_DEVTOOLS_EXTENSION__

      if (!extension) return

      const connection = extension.connect({
        name: options.name || 'OxogState Store',
      })

      connection.init(store.getState())

      store.subscribe((state, prevState) => {
        connection.send(
          { type: 'UPDATE', prev: prevState },
          state
        )
      })

      connection.subscribe((message: any) => {
        if (message.type === 'DISPATCH' && message.payload) {
          if (message.payload.type === 'JUMP_TO_ACTION') {
            store.setState(message.payload.state)
          }
        }
      })
    }
  }
}
```

### 8.4 History Plugin

```typescript
function historyPlugin<TState>(options: {
  limit?: number
} = {}): Plugin<TState> {
  const limit = options.limit || 50
  const past: TState[] = []
  const future: TState[] = []

  return {
    name: 'history',
    version: '1.0.0',
    install(store) {
      store.subscribe((state, prevState) => {
        past.push(prevState)
        if (past.length > limit) {
          past.shift()
        }
        future.length = 0 // Clear future on new action
      })

      // Add undo/redo methods
      store.undo = () => {
        if (past.length > 0) {
          const previous = past.pop()!
          future.push(store.getState())
          store.setState(previous)
        }
      }

      store.redo = () => {
        if (future.length > 0) {
          const next = future.pop()!
          past.push(store.getState())
          store.setState(next)
        }
      }
    }
  }
}
```

### 8.5 Sync Plugin

```typescript
function syncPlugin<TState>(options: {
  channel?: string
} = {}): Plugin<TState> {
  return {
    name: 'sync',
    version: '1.0.0',
    install(store) {
      if (typeof BroadcastChannel === 'undefined') return

      const channel = new BroadcastChannel(options.channel || 'oxog-state')

      channel.onmessage = (event) => {
        store.setState(event.data)
      }

      store.subscribe((state) => {
        channel.postMessage(state)
      })

      // Cleanup
      store.onDestroy = () => {
        channel.close()
      }
    }
  }
}
```

### 8.6 Immer Plugin

Zero-dependency immer using Proxy:

```typescript
function immerPlugin<TState>(): Plugin<TState> {
  return {
    name: 'immer',
    version: '1.0.0',
    install(store) {
      const produce = <T>(base: T, recipe: (draft: T) => void): T => {
        const copies = new Map<any, any>()
        const proxied = createProxy(base, copies)

        recipe(proxied as T)

        return finalize(base, copies)
      }

      const createProxy = <T>(base: T, copies: Map<any, any>): T => {
        return new Proxy(base || {}, {
          get(target, key) {
            const value = (target as any)[key]
            if (typeof value === 'object' && value !== null) {
              return createProxy(value, copies)
            }
            return value
          },
          set(target, key, value) {
            if (!copies.has(target)) {
              copies.set(target, shallowClone(target))
            }
            const copy = copies.get(target)
            copy[key] = value
            return true
          }
        }) as T
      }

      // Wrap setState with produce
      const originalSetState = store.setState.bind(store)
      store.setState = (update) => {
        if (typeof update === 'function') {
          const result = produce(store.getState(), (draft: any) => {
            const partial = update(draft)
            Object.assign(draft, partial)
          })
          originalSetState(result)
        } else {
          originalSetState(update)
        }
      }
    }
  }
}
```

## 9. Testing Strategy

### 9.1 Test Structure

```
tests/
├── unit/           # Isolated unit tests
│   ├── kernel.test.ts
│   ├── store.test.ts
│   └── ...
├── integration/    # Cross-module tests
│   └── store-plugins.test.ts
└── fixtures/       # Test data
    └── test-stores.ts
```

### 9.2 Coverage Requirements

- Every function must have tests
- Every branch must be tested
- Error conditions must be tested
- Edge cases must be covered

### 9.3 Test Helpers

```typescript
// Create test store
function createTestStore<T>(state: T): Store<T> {
  return createStore(state)
}

// Wait for async
function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Spy on function
function spyOn<T extends Function>(fn: T): T & { calls: any[][] } {
  const spy = ((...args: any[]) => {
    spy.calls.push(args)
    return fn(...args)
  }) as any
  spy.calls = []
  return spy
}
```

## 10. Build Configuration

### 10.1 TypeScript Config

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

### 10.2 tsup Configuration

Multiple outputs:
- ESM for modern bundlers
- CJS for Node.js
- IIFE for CDN usage
- DTS for TypeScript

## 11. Performance Optimizations

### 11.1 Memoization

- Selector results cached until state changes
- Computed values cached with state-based keys
- Equality checks before notifications

### 11.2 Minimal Re-renders

- React hook only updates when selected value changes
- Selector subscriptions use equality functions
- Batch updates reduce notification overhead

### 11.3 Memory Management

- WeakMap for storing private data
- Proper cleanup on destroy
- Circular buffer for history (configurable limit)

---

This implementation design ensures:
1. Zero dependencies
2. Type safety throughout
3. Maintainable code structure
4. Testable components
5. Performance optimizations
