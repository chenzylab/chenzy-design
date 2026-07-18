import { describe, expect, it } from 'vitest';
import { pathGet, pathSet, pathHas, pathRemove, toSegments } from './form-path.js';

describe('form-path', () => {
  it('toSegments parses bracket + dot paths', () => {
    expect(toSegments('users[0].name')).toEqual(['users', '0', 'name']);
    expect(toSegments('a.b.c')).toEqual(['a', 'b', 'c']);
  });

  it('pathGet reads nested array/object paths', () => {
    const obj = { users: [{ name: 'ada' }, { name: 'bob' }] };
    expect(pathGet(obj, 'users[0].name')).toBe('ada');
    expect(pathGet(obj, 'users[1].name')).toBe('bob');
    expect(pathGet(obj, 'users[2].name')).toBeUndefined();
  });

  it('pathSet auto-creates arrays for numeric segments', () => {
    const out = pathSet({}, 'users[0].name', 'ada');
    expect(out).toEqual({ users: [{ name: 'ada' }] });
    expect(Array.isArray((out as { users: unknown }).users)).toBe(true);
  });

  it('pathSet is immutable — returns a fresh root, does not mutate input', () => {
    const before = { a: { b: 1 } };
    const after = pathSet(before, 'a.c', 2);
    expect(after).not.toBe(before);
    expect(before).toEqual({ a: { b: 1 } }); // untouched
    expect(after).toEqual({ a: { b: 1, c: 2 } });
  });

  it('pathSet clones only the touched branch (structural sharing elsewhere)', () => {
    const shared = { keep: 1 };
    const before = { branch: { x: 1 }, other: shared };
    const after = pathSet(before, 'branch.y', 2) as typeof before;
    // the untouched sibling keeps the same reference
    expect(after.other).toBe(shared);
    // the touched branch is a new object
    expect(after.branch).not.toBe(before.branch);
  });

  it('pathHas reflects presence', () => {
    const obj = { a: [{ b: 1 }] };
    expect(pathHas(obj, 'a[0].b')).toBe(true);
    expect(pathHas(obj, 'a[0].c')).toBe(false);
    expect(pathHas(obj, 'z')).toBe(false);
  });

  it('pathRemove deletes an object leaf immutably', () => {
    const before = { a: { b: 1, c: 2 } };
    const after = pathRemove(before, 'a.b') as { a: Record<string, unknown> };
    expect(after).not.toBe(before);
    expect(after.a).toEqual({ c: 2 });
    expect(before.a).toEqual({ b: 1, c: 2 });
  });

  it('pathRemove nulls an array leaf (keeps the index slot)', () => {
    const before = { a: [{ b: 1 }, { b: 2 }] };
    const after = pathRemove(before, 'a[0]') as { a: unknown[] };
    expect(after.a[0]).toBeUndefined();
    expect(after.a[1]).toEqual({ b: 2 });
    // length preserved (Semi-style hole, not a splice)
    expect(after.a.length).toBe(2);
  });
});
