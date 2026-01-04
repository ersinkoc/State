# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
