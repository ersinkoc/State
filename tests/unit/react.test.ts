/**
 * Tests for React integration.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore, useCreateStore, useAction } from '../../src/react.js';
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
