import { describe, it, expect } from 'vitest';
import {
  parseSideBarWidth,
  clampSideBarWidth,
  filterMcpOptions,
  toggleMcpOptionActive,
  countActiveMcpOptions,
  type McpOptionCore,
} from './sidebar.js';

describe('parseSideBarWidth', () => {
  it('returns numbers as-is', () => {
    expect(parseSideBarWidth(400)).toBe(400);
    expect(parseSideBarWidth(0)).toBe(0);
  });
  it('parses px strings', () => {
    expect(parseSideBarWidth('320px')).toBe(320);
  });
  it('parses bare numeric strings', () => {
    expect(parseSideBarWidth('250')).toBe(250);
  });
  it('returns undefined for nullish / non-finite', () => {
    expect(parseSideBarWidth(undefined)).toBeUndefined();
    expect(parseSideBarWidth('auto')).toBeUndefined();
    expect(parseSideBarWidth(Number.NaN)).toBeUndefined();
  });
});

describe('clampSideBarWidth', () => {
  it('clamps to min', () => {
    expect(clampSideBarWidth(100, 150, undefined)).toBe(150);
  });
  it('clamps to max', () => {
    expect(clampSideBarWidth(900, undefined, 600)).toBe(600);
  });
  it('passes through when in range', () => {
    expect(clampSideBarWidth(300, 150, 600)).toBe(300);
  });
  it('handles both bounds undefined', () => {
    expect(clampSideBarWidth(300, undefined, undefined)).toBe(300);
  });
});

const OPTS: McpOptionCore[] = [
  { value: 'fs', label: 'File System', active: true },
  { value: 'git', label: 'Git', active: false },
  { value: 'preset', label: 'Preset Search', active: true, disabled: true },
];

describe('filterMcpOptions', () => {
  it('returns all on empty input', () => {
    expect(filterMcpOptions('', OPTS)).toHaveLength(3);
    expect(filterMcpOptions('   ', OPTS)).toHaveLength(3);
  });
  it('matches label case-insensitively', () => {
    expect(filterMcpOptions('git', OPTS).map((o) => o.value)).toEqual(['git']);
    expect(filterMcpOptions('SEARCH', OPTS).map((o) => o.value)).toEqual(['preset']);
  });
  it('falls back to value when label missing', () => {
    const list: McpOptionCore[] = [{ value: 'onlyvalue' }];
    expect(filterMcpOptions('only', list)).toHaveLength(1);
  });
  it('honors a custom filter predicate over default', () => {
    const only = filterMcpOptions('x', OPTS, (_i, o) => o.value === 'fs');
    expect(only.map((o) => o.value)).toEqual(['fs']);
  });
  it('does not mutate the source array', () => {
    const copy = [...OPTS];
    filterMcpOptions('git', OPTS);
    expect(OPTS).toEqual(copy);
  });
});

describe('toggleMcpOptionActive', () => {
  it('flips active of the matching option, returns new array', () => {
    const next = toggleMcpOptionActive(OPTS, 'git', true);
    expect(next).not.toBe(OPTS);
    expect(next.find((o) => o.value === 'git')?.active).toBe(true);
    expect(next.find((o) => o.value === 'fs')?.active).toBe(true);
  });
  it('never toggles a disabled option', () => {
    const next = toggleMcpOptionActive(OPTS, 'preset', false);
    expect(next.find((o) => o.value === 'preset')?.active).toBe(true);
  });
  it('is a no-op for unknown value (identity-equal contents)', () => {
    const next = toggleMcpOptionActive(OPTS, 'nope', false);
    expect(next.map((o) => o.active)).toEqual(OPTS.map((o) => o.active));
  });
});

describe('countActiveMcpOptions', () => {
  it('counts active across multiple lists', () => {
    expect(countActiveMcpOptions(OPTS)).toBe(2);
    expect(countActiveMcpOptions(OPTS, [{ value: 'x', active: true }])).toBe(3);
  });
  it('returns 0 for empty', () => {
    expect(countActiveMcpOptions([])).toBe(0);
    expect(countActiveMcpOptions()).toBe(0);
  });
});
