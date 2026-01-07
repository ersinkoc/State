# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-08

### Added

#### Patterns
- **Slices** - Modular state organization with `createSlice()` for namespaced state and actions
- **Computed Values** - Memoized derived values with `computed()` function
- **Store Federation** - Combine multiple stores with `createFederation()` for large applications

#### React Hooks
- `useShallow()` - Wrap selectors returning objects to prevent unnecessary re-renders with shallow equality
- `useStoreSelector()` - Select multiple values with named selectors, each tracked independently
- `useStoreActions()` - Get multiple actions at once with stable references
- `useSetState()` - Get a stable setState function for partial updates
- `useTransientSubscribe()` - Subscribe to state changes without causing re-renders (for analytics, side effects)

#### New Plugins
- **logger** - Development logging with diff, timestamps, collapsed groups, and custom filtering
- **effects** - Reactive side effects with `createEffect()`, debounce, cleanup, and abort signal support
- **validate** - Schema-agnostic validation supporting Zod, Yup, or custom validators with timing control

#### Enhanced Persist Plugin
- `version` - State versioning for migrations
- `migrate` - Migration function between versions
- `partialize` - Select which state to persist
- `encrypt/decrypt` - Optional encryption/decryption functions
- `writeDebounce` - Debounce writes to storage
- `onRehydrateStorage` - Callback when state is hydrated
- `onHydrationComplete` - Callback after hydration completes
- `onPersistError` - Error handling callback

#### Testing Utilities
- `createTestStore()` - Create isolated store instances for testing
- `mockStore()` - Create mock stores with action call tracking
- `getStoreSnapshot()` / `restoreStoreSnapshot()` - Snapshot testing support
- `mockStorage()` - Mock storage for persist plugin testing

#### Middleware Compatibility
- Generic middleware compatibility layer for third-party middleware integration

### Changed
- Improved `useStoreSelector` implementation with proper memoization to prevent infinite loops
- Enhanced TypeScript types with `InferSliceState`, `InferSliceActions`, `InferFederationState`

### Fixed
- Fixed `useStoreSelector` infinite re-subscription issue with `useCallback` memoization

## [1.0.0] - 2026-01-04

### Added

- Initial release of @oxog/state
- Core store functionality with `createStore()`, `getState()`, `setState()`, `merge()`, `reset()`, `destroy()`
- Subscription system with selector support and equality functions
- Batch updates with `batch()` function
- Plugin system with lifecycle hooks
- Built-in plugins:
  - `persist` - State persistence to localStorage/sessionStorage
  - `devtools` - Redux DevTools integration
  - `history` - Undo/redo functionality
  - `sync` - Cross-tab synchronization via BroadcastChannel
  - `immer` - Immutable updates with mutable syntax
  - `selector` - Computed/derived values
- React integration with `useStore()`, `useCreateStore()`, `useAction()` hooks
- Full TypeScript support with strict mode
- Zero runtime dependencies
- 100% test coverage
