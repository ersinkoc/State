/**
 * Test fixtures for consistent testing across all test suites.
 */

import { createStore } from '../../src/index.js';

/**
 * Simple counter store for basic tests.
 */
export function createCounterStore() {
  return createStore({
    count: 0,
  });
}

/**
 * Counter store with actions.
 */
export function createCounterStoreWithActions() {
  return createStore({
    count: 0,
    $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    $decrement: (state: { count: number }) => ({ count: state.count - 1 }),
    $incrementBy: (state: { count: number }, by: number) => ({ count: state.count + by }),
  });
}

/**
 * Todo store for array operations.
 */
export function createTodoStore() {
  return createStore({
    todos: [] as Array<{ id: number; text: string; done: boolean }>,
    filter: 'all' as 'all' | 'active' | 'completed',
  });
}

/**
 * User store with nested objects.
 */
export function createUserStore() {
  return createStore({
    user: null as { name: string; age: number; email: string } | null,
    settings: {
      theme: 'light' as 'light' | 'dark',
      notifications: true,
    },
  });
}

/**
 * Async store for data fetching tests.
 */
export function createAsyncStore() {
  return createStore({
    data: null as unknown,
    loading: false,
    error: null as Error | null,
  });
}

/**
 * Store with nested state for deep merge tests.
 */
export function createNestedStore() {
  return createStore({
    a: 1,
    b: {
      c: 2,
      d: {
        e: 3,
      },
    },
  });
}

/**
 * Store with arrays for array tests.
 */
export function createArrayStore() {
  return createStore({
    items: [1, 2, 3],
    nested: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
  });
}

/**
 * Complex store for integration tests.
 */
export function createComplexStore() {
  return createStore({
    users: [] as Array<{ id: number; name: string; role: 'admin' | 'user' }>,
    currentUser: null as { id: number; name: string } | null,
    filters: {
      search: '',
      role: null as 'admin' | 'user' | null,
    },
    pagination: {
      page: 1,
      perPage: 10,
      total: 0,
    },
  });
}
