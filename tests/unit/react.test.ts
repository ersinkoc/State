/**
 * Tests for React integration.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useStore,
  useCreateStore,
  useAction,
  useStoreActions,
  useStoreSelector,
  useTransientSubscribe,
  useSetState,
  useShallow,
} from '../../src/react.js';
import { createStore } from '../../src/store.js';

describe('useStore', () => {
  it('should return current state', () => {
    const store = createStore({ count: 0 });

    const { result } = renderHook(() => useStore(store));

    expect(result.current).toEqual({ count: 0 });
  });

  it('should re-render on state change', () => {
    const store = createStore({ count: 0 });

    const { result } = renderHook(() => useStore(store));

    act(() => {
      store.setState({ count: 1 });
    });

    expect(result.current).toEqual({ count: 1 });
  });

  it('should support selector', () => {
    const store = createStore({ count: 0, name: 'test' });

    const { result } = renderHook(() => useStore(store, (s) => s.count));

    expect(result.current).toBe(0);

    act(() => {
      store.setState({ count: 5 });
    });

    expect(result.current).toBe(5);
  });

  it('should not re-render when selected value unchanged', () => {
    const store = createStore({ count: 0, name: 'test' });

    const renderCount = vi.fn();

    const { result } = renderHook(() => {
      renderCount();
      return useStore(store, (s) => s.count);
    });

    act(() => {
      store.setState({ name: 'changed' });
    });

    // Should not re-render since count didn't change
    expect(renderCount).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(0);
  });

  it('should support custom equality function', () => {
    const store = createStore({ items: [1, 2, 3] });

    const renderCount = vi.fn();

    renderHook(() => {
      renderCount();
      return useStore(
        store,
        (s) => s.items,
        () => true // Always equal
      );
    });

    act(() => {
      store.setState({ items: [4, 5, 6] });
    });

    // Should not re-render due to custom equality
    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on unmount', () => {
    const store = createStore({ count: 0 });
    const unsubscribe = vi.fn();

    const originalSubscribe = store.subscribe.bind(store);
    store.subscribe = ((listener: any) => {
      const unsub = originalSubscribe(listener);
      return () => {
        unsubscribe();
        unsub();
      };
    }) as any;

    const { unmount } = renderHook(() => useStore(store));

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('useCreateStore', () => {
  it('should create a store', () => {
    const { result } = renderHook(() => useCreateStore({ count: 0 }));

    expect(result.current).toBeDefined();
    expect(result.current.getState()).toEqual({ count: 0 });
  });

  it('should persist across re-renders', () => {
    const { result, rerender } = renderHook(() => useCreateStore({ count: 0 }));

    const firstStore = result.current;

    act(() => {
      firstStore.setState({ count: 5 });
    });

    rerender();

    expect(result.current).toBe(firstStore);
    expect(result.current.getState()).toEqual({ count: 5 });
  });

  it('should destroy store on unmount', () => {
    const { result, unmount } = renderHook(() => useCreateStore({ count: 0 }));

    const store = result.current;

    // Unmount the hook
    unmount();

    // Store should be destroyed
    expect(() => {
      if (store) store.getState();
    }).toThrow();
  });
});

describe('useAction', () => {
  it('should return action function', () => {
    const store = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    });

    const { result } = renderHook(() => useAction(store, 'increment'));

    expect(typeof result.current).toBe('function');
  });

  it('should call action', () => {
    const store = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    });

    const { result } = renderHook(() => useAction(store, 'increment'));

    act(() => {
      result.current();
    });

    expect(store.getState()).toEqual({ count: 1 });
  });
});

describe('useStore - coverage tests', () => {
  // Test lines 74-75, 77-78: ref updates
  it('should update selector ref when selector changes', () => {
    const store = createStore({ count: 0, name: 'test' });
    const { result, rerender } = renderHook(
      ({ selector }) => useStore(store, selector),
      {
        initialProps: {
          selector: (s: any) => s.count,
        },
      }
    );

    expect(result.current).toBe(0);

    // Change selector
    rerender({ selector: (s: any) => s.name });

    expect(result.current).toBe('test');
  });

  it('should update equalityFn ref when equalityFn changes', () => {
    const store = createStore({ items: [1, 2, 3] });
    const customEqual = () => true; // Always equal
    const { result, rerender } = renderHook(
      ({ equalityFn }) => useStore(store, (s: any) => s.items, equalityFn),
      {
        initialProps: {
          equalityFn: undefined as any,
        },
      }
    );

    const firstValue = result.current;

    // Change equalityFn
    rerender({ equalityFn: customEqual });

    store.setState({ items: [4, 5, 6] });

    // With customEqual that always returns true, value should not update
    expect(result.current).toBe(firstValue);
  });

  it('should update store ref when store changes', () => {
    const store1 = createStore({ count: 0 });
    const store2 = createStore({ count: 10 });
    const { result, rerender } = renderHook(
      ({ store: storeProp }) => useStore(storeProp, (s: any) => s.count),
      {
        initialProps: { store: store1 },
      }
    );

    expect(result.current).toBe(0);

    rerender({ store: store2 });

    expect(result.current).toBe(10);
  });
});

describe('useAction - coverage tests', () => {
  // Test lines 207-208, 216-217: ref updates
  it('should update action ref when action changes', () => {
    const store = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
      $decrement: (state: { count: number }) => ({ count: state.count - 1 }),
    });

    const { result, rerender } = renderHook(
      ({ actionName }) => useAction(store, actionName),
      {
        initialProps: { actionName: 'increment' },
      }
    );

    expect(typeof result.current).toBe('function');

    act(() => {
      result.current();
    });

    expect(store.getState()).toEqual({ count: 1 });

    // Change action
    rerender({ actionName: 'decrement' });

    expect(typeof result.current).toBe('function');

    act(() => {
      result.current();
    });

    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should update store ref in useAction when store changes', () => {
    const store1 = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    });

    const store2 = createStore({
      count: 10,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    });

    const { result, rerender } = renderHook(
      ({ store: storeProp }) => useAction(storeProp, 'increment'),
      {
        initialProps: { store: store1 },
      }
    );

    act(() => {
      result.current();
    });

    expect(store1.getState()).toEqual({ count: 1 });

    rerender({ store: store2 });

    act(() => {
      result.current();
    });

    expect(store2.getState()).toEqual({ count: 11 });
  });
});

describe('useStoreActions', () => {
  it('should return multiple action functions', () => {
    const store = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
      $decrement: (state: { count: number }) => ({ count: state.count - 1 }),
      $reset: () => ({ count: 0 }),
    });

    const { result } = renderHook(() =>
      useStoreActions(store, 'increment', 'decrement', 'reset')
    );

    expect(typeof result.current.increment).toBe('function');
    expect(typeof result.current.decrement).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should call actions correctly', () => {
    const store = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
      $decrement: (state: { count: number }) => ({ count: state.count - 1 }),
    });

    const { result } = renderHook(() =>
      useStoreActions(store, 'increment', 'decrement')
    );

    act(() => {
      result.current.increment();
    });
    expect(store.getState().count).toBe(1);

    act(() => {
      result.current.decrement();
    });
    expect(store.getState().count).toBe(0);
  });

  it('should cache actions across renders', () => {
    const store = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    });

    const { result, rerender } = renderHook(() =>
      useStoreActions(store, 'increment')
    );

    const firstAction = result.current.increment;

    rerender();

    expect(result.current.increment).toBe(firstAction);
  });

  it('should update actions when store changes', () => {
    const store1 = createStore({
      count: 0,
      $increment: (state: { count: number }) => ({ count: state.count + 1 }),
    });
    const store2 = createStore({
      count: 10,
      $increment: (state: { count: number }) => ({ count: state.count + 2 }),
    });

    const { result, rerender } = renderHook(
      ({ store }) => useStoreActions(store, 'increment'),
      { initialProps: { store: store1 } }
    );

    act(() => {
      result.current.increment();
    });
    expect(store1.getState().count).toBe(1);

    rerender({ store: store2 });

    act(() => {
      result.current.increment();
    });
    expect(store2.getState().count).toBe(12);
  });
});

describe('useStoreSelector', () => {
  it('should select multiple values with named selectors', () => {
    const store = createStore({
      users: [{ id: 1, active: true }, { id: 2, active: false }],
      orders: [{ total: 100 }, { total: 200 }],
    });

    const { result } = renderHook(() =>
      useStoreSelector(store, {
        userCount: (s: any) => s.users.length,
        activeUsers: (s: any) => s.users.filter((u: any) => u.active).length,
        totalRevenue: (s: any) => s.orders.reduce((sum: number, o: any) => sum + o.total, 0),
      })
    );

    expect(result.current.userCount).toBe(2);
    expect(result.current.activeUsers).toBe(1);
    expect(result.current.totalRevenue).toBe(300);
  });

  it('should re-render only when selected values change', () => {
    const store = createStore({
      count: 0,
      name: 'test',
    });

    const renderCount = vi.fn();

    const { result } = renderHook(() => {
      renderCount();
      return useStoreSelector(store, {
        count: (s: any) => s.count,
      });
    });

    expect(result.current.count).toBe(0);

    // Change name - should not cause re-render
    act(() => {
      store.setState({ name: 'changed' });
    });

    // Only initial render
    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  it('should update when selected values change', () => {
    const store = createStore({
      count: 0,
      name: 'test',
    });

    const { result } = renderHook(() =>
      useStoreSelector(store, {
        count: (s: any) => s.count,
        name: (s: any) => s.name,
      })
    );

    expect(result.current.count).toBe(0);
    expect(result.current.name).toBe('test');

    act(() => {
      store.setState({ count: 5, name: 'updated' });
    });

    expect(result.current.count).toBe(5);
    expect(result.current.name).toBe('updated');
  });

  it('should update selectors ref when selectors object changes', () => {
    const store = createStore({ a: 1, b: 2 });

    const { result, rerender } = renderHook(
      ({ selectors }) => useStoreSelector(store, selectors),
      {
        initialProps: {
          selectors: { value: (s: any) => s.a },
        },
      }
    );

    expect(result.current.value).toBe(1);

    rerender({ selectors: { value: (s: any) => s.b } });

    expect(result.current.value).toBe(2);
  });
});

describe('useTransientSubscribe', () => {
  it('should subscribe without causing re-renders', () => {
    const store = createStore({ count: 0 });
    const callback = vi.fn();
    const renderCount = vi.fn();

    renderHook(() => {
      renderCount();
      useTransientSubscribe(
        store,
        (s: any) => s.count,
        callback
      );
    });

    act(() => {
      store.setState({ count: 1 });
    });

    // Callback should be called
    expect(callback).toHaveBeenCalledWith(1, 0);

    // But no re-render should occur (only initial render)
    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  it('should call callback on state changes', () => {
    const store = createStore({ count: 0 });
    const callback = vi.fn();

    renderHook(() =>
      useTransientSubscribe(
        store,
        (s: any) => s.count,
        callback
      )
    );

    act(() => {
      store.setState({ count: 1 });
    });

    expect(callback).toHaveBeenCalledWith(1, 0);

    act(() => {
      store.setState({ count: 5 });
    });

    expect(callback).toHaveBeenCalledWith(5, 1);
  });

  it('should use custom equality function', () => {
    const store = createStore({ count: 0 });
    const callback = vi.fn();

    renderHook(() =>
      useTransientSubscribe(
        store,
        (s: any) => s.count,
        callback,
        () => true // Always equal - never trigger callback
      )
    );

    act(() => {
      store.setState({ count: 1 });
    });

    // Callback should not be called due to custom equality
    expect(callback).not.toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const store = createStore({ count: 0 });
    const callback = vi.fn();

    const { unmount } = renderHook(() =>
      useTransientSubscribe(
        store,
        (s: any) => s.count,
        callback
      )
    );

    unmount();

    act(() => {
      store.setState({ count: 1 });
    });

    // Callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled();
  });

  it('should update callback ref when callback changes', () => {
    const store = createStore({ count: 0 });
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) =>
        useTransientSubscribe(
          store,
          (s: any) => s.count,
          callback
        ),
      { initialProps: { callback: callback1 } }
    );

    act(() => {
      store.setState({ count: 1 });
    });

    expect(callback1).toHaveBeenCalled();

    rerender({ callback: callback2 });

    act(() => {
      store.setState({ count: 2 });
    });

    // New callback should be called
    expect(callback2).toHaveBeenCalled();
  });
});

describe('useSetState', () => {
  it('should return setState function', () => {
    const store = createStore({ count: 0 });

    const { result } = renderHook(() => useSetState(store));

    expect(typeof result.current).toBe('function');
  });

  it('should update state with partial object', () => {
    const store = createStore({ count: 0, name: 'test' });

    const { result } = renderHook(() => useSetState(store));

    act(() => {
      result.current({ count: 5 });
    });

    expect(store.getState()).toEqual({ count: 5, name: 'test' });
  });

  it('should update state with function', () => {
    const store = createStore({ count: 0 });

    const { result } = renderHook(() => useSetState(store));

    act(() => {
      result.current((state: any) => ({ count: state.count + 1 }));
    });

    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should maintain stable reference across renders', () => {
    const store = createStore({ count: 0 });

    const { result, rerender } = renderHook(() => useSetState(store));

    const firstSetState = result.current;

    rerender();

    expect(result.current).toBe(firstSetState);
  });

  it('should update store ref when store changes', () => {
    const store1 = createStore({ count: 0 });
    const store2 = createStore({ count: 10 });

    const { result, rerender } = renderHook(
      ({ store }) => useSetState(store),
      { initialProps: { store: store1 } }
    );

    act(() => {
      result.current({ count: 5 });
    });

    expect(store1.getState().count).toBe(5);

    rerender({ store: store2 });

    act(() => {
      result.current({ count: 15 });
    });

    expect(store2.getState().count).toBe(15);
  });
});

describe('useShallow', () => {
  it('should select with shallow equality', () => {
    const store = createStore({
      users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
      other: 'data',
    });

    const renderCount = vi.fn();

    const { result } = renderHook(() => {
      renderCount();
      // useShallow wraps a selector for use with useStore
      return useStore(
        store,
        useShallow((s: any) => ({
          count: s.users.length,
          firstUser: s.users[0],
        }))
      );
    });

    expect(result.current.count).toBe(2);
    expect(result.current.firstUser).toEqual({ id: 1, name: 'Alice' });

    // Change unrelated state - should not re-render
    act(() => {
      store.setState({ other: 'updated' });
    });

    // Only initial render
    expect(renderCount).toHaveBeenCalledTimes(1);
  });

  it('should re-render when shallow values change', () => {
    const store = createStore({
      count: 0,
      name: 'test',
    });

    const { result } = renderHook(() =>
      useStore(
        store,
        useShallow((s: any) => ({
          count: s.count,
          name: s.name,
        }))
      )
    );

    expect(result.current.count).toBe(0);

    act(() => {
      store.setState({ count: 5 });
    });

    expect(result.current.count).toBe(5);
  });
});
