import { describe, expect, it } from 'vitest';
import {
  isDropdownDivider,
  isDropdownGroup,
  hasDropdownChildren,
  type DropdownItem,
} from './types.js';

describe('dropdown type guards', () => {
  const leaf: DropdownItem = { key: 'a', label: 'A' };
  const submenu: DropdownItem = {
    key: 'b',
    label: 'B',
    children: [{ key: 'b1', label: 'B1' }],
  };
  const divider: DropdownItem = { type: 'divider' };
  const group: DropdownItem = {
    type: 'group',
    label: 'G',
    children: [{ key: 'g1', label: 'G1' }],
  };

  it('isDropdownDivider only matches divider nodes', () => {
    expect(isDropdownDivider(divider)).toBe(true);
    expect(isDropdownDivider(leaf)).toBe(false);
    expect(isDropdownDivider(group)).toBe(false);
    expect(isDropdownDivider(submenu)).toBe(false);
  });

  it('isDropdownGroup only matches group nodes', () => {
    expect(isDropdownGroup(group)).toBe(true);
    expect(isDropdownGroup(leaf)).toBe(false);
    expect(isDropdownGroup(divider)).toBe(false);
    expect(isDropdownGroup(submenu)).toBe(false);
  });

  it('hasDropdownChildren detects expandable submenu items', () => {
    expect(hasDropdownChildren(submenu)).toBe(true);
    expect(hasDropdownChildren(leaf)).toBe(false);
    expect(hasDropdownChildren({ key: 'c', label: 'C', children: [] })).toBe(false);
  });

  it('backward compat: a flat item without type is a valid DropdownItem', () => {
    const items: DropdownItem[] = [
      { key: 'edit', label: '编辑' },
      { key: 'del', label: '删除', danger: true, disabled: true },
    ];
    expect(items.every((i) => !isDropdownDivider(i) && !isDropdownGroup(i))).toBe(true);
  });
});
