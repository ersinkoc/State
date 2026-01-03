/**
 * Tests for utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  deepClone,
  deepEqual,
  shallowEqual,
  deepMerge,
  isFunction,
  pick,
  omit,
  identity,
} from '../../src/utils/index.js';

describe('deepClone', () => {
  it('should clone primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  it('should clone Date objects', () => {
    const date = new Date('2024-01-01');
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, { a: 3 }];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[2]).not.toBe(arr[2]);
  });

  it('should clone plain objects', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it('should handle circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    const cloned = deepClone(obj);
    expect(cloned.a).toBe(1);
    expect(cloned.self).toBe(cloned);
  });
});

describe('shallowEqual', () => {
  it('should return true for equal primitives', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual('hello', 'hello')).toBe(true);
    expect(shallowEqual(true, true)).toBe(true);
  });

  it('should return false for unequal primitives', () => {
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual('hello', 'world')).toBe(false);
    expect(shallowEqual(true, false)).toBe(false);
  });

  it('should return true for NaN', () => {
    expect(shallowEqual(NaN, NaN)).toBe(true);
  });

  it('should return true for equal objects', () => {
    expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it('should return false for unequal objects', () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('should not deeply compare', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { b: 1 } };
    expect(shallowEqual(obj1, obj2)).toBe(false); // Different references
    expect(shallowEqual(obj1, obj1)).toBe(true); // Same reference
  });
});

describe('deepEqual', () => {
  it('should return true for equal primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('hello', 'hello')).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
  });

  it('should return false for unequal primitives', () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual('hello', 'world')).toBe(false);
  });

  it('should return true for NaN', () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  it('should deeply compare objects', () => {
    expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
  });

  it('should return false for deeply unequal objects', () => {
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it('should compare arrays', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual([1, 2], [1, 3])).toBe(false);
  });

  it('should handle null', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(null, {})).toBe(false);
    expect(deepEqual({}, null)).toBe(false);
  });
});

describe('deepMerge', () => {
  it('should merge simple objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should deeply merge nested objects', () => {
    const target = { a: { b: { c: 1 } } };
    const source = { a: { b: { d: 2 } } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
  });

  it('should not mutate target', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = deepMerge(target, source);
    expect(target).toEqual({ a: 1 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should replace arrays', () => {
    const target = { items: [1, 2] };
    const source = { items: [3, 4] };
    const result = deepMerge(target, source);
    expect(result.items).toEqual([3, 4]);
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01');
    const target = { date };
    const source = { other: 'value' };
    const result = deepMerge(target, source);
    expect(result.date).toEqual(date);
    expect(result.date).not.toBe(date);
  });

  it('should handle null source', () => {
    const target = { a: 1 };
    const result = deepMerge(target, null as any);
    expect(result).toEqual(target);
  });

  it('should handle non-object source', () => {
    const target = { a: 1 };
    const result = deepMerge(target, 'string' as any);
    expect(result).toBe('string');
  });
});

describe('isFunction', () => {
  it('should return true for functions', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function () {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction(function* () {})).toBe(true);
  });

  it('should return false for non-functions', () => {
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction(42)).toBe(false);
    expect(isFunction('string')).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
  });
});

describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = pick(obj, ['a', 'c']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should handle empty keys array', () => {
    const obj = { a: 1, b: 2 };
    const result = pick(obj, []);
    expect(result).toEqual({});
  });

  it('should ignore non-existent keys', () => {
    const obj = { a: 1 };
    const result = pick(obj, ['a', 'b'] as any);
    expect(result).toEqual({ a: 1 });
  });

  it('should not mutate original', () => {
    const obj = { a: 1, b: 2 };
    const result = pick(obj, ['a']);
    expect(obj).toEqual({ a: 1, b: 2 });
    expect(result).toEqual({ a: 1 });
  });
});

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, ['b']);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should handle empty keys array', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, []);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should ignore non-existent keys', () => {
    const obj = { a: 1 };
    const result = omit(obj, ['a', 'b'] as any);
    expect(result).toEqual({});
  });

  it('should not mutate original', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, ['b']);
    expect(obj).toEqual({ a: 1, b: 2 });
    expect(result).toEqual({ a: 1 });
  });
});

describe('identity', () => {
  it('should return the input value', () => {
    expect(identity(42)).toBe(42);
    expect(identity('hello')).toBe('hello');
    expect(identity(null)).toBe(null);
    expect(identity(undefined)).toBe(undefined);
    expect(identity({ a: 1 })).toEqual({ a: 1 });
  });
});
