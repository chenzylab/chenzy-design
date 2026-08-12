// Tree 值通道：对齐 Semi getValueOrKey——节点声明 value 字段时，onChange/受控 value
// 走 value（缺省 fallback key）。无 value 字段的既有用法（纯 key 通道）保持不变。
import { describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale } from '../test-utils/a11y.js';
import Tree from './Tree.svelte';

const treeDataWithValue = [
  {
    key: 'k-parent',
    value: 'v-parent',
    label: 'Parent',
    children: [
      { key: 'k-child-1', value: 'v-child-1', label: 'Child 1' },
      { key: 'k-child-2', value: 'v-child-2', label: 'Child 2' },
    ],
  },
];

const treeDataNoValue = [
  { key: 'k-a', label: 'A' },
  { key: 'k-b', label: 'B' },
];

describe('Tree 值通道对齐 Semi getValueOrKey', () => {
  it('单选：节点有 value 字段时，onChange 回传 value（非 key）', async () => {
    let received: unknown;
    const { container } = renderWithLocale(Tree, {
      props: {
        treeData: treeDataWithValue,
        defaultExpandAll: true,
        onChange: (v: unknown) => {
          received = v;
        },
      },
    });
    const child1 = Array.from(container.querySelectorAll('[role="treeitem"]')).find((el) =>
      el.textContent?.includes('Child 1'),
    ) as HTMLElement;
    await fireEvent.click(child1);
    expect(received).toBe('v-child-1');
  });

  it('单选：节点无 value 字段时，onChange 回传 key（向后兼容）', async () => {
    let received: unknown;
    const { container } = renderWithLocale(Tree, {
      props: {
        treeData: treeDataNoValue,
        onChange: (v: unknown) => {
          received = v;
        },
      },
    });
    const a = Array.from(container.querySelectorAll('[role="treeitem"]')).find((el) =>
      el.textContent?.includes('A'),
    ) as HTMLElement;
    await fireEvent.click(a);
    expect(received).toBe('k-a');
  });

  it('多选：onChange 回传 value 数组（对齐 Semi getValueOrKey 数组分支）', async () => {
    let received: unknown;
    const { container } = renderWithLocale(Tree, {
      props: {
        treeData: treeDataWithValue,
        defaultExpandAll: true,
        multiple: true,
        onChange: (v: unknown) => {
          received = v;
        },
      },
    });
    const child1Row = Array.from(container.querySelectorAll('[role="treeitem"]')).find((el) =>
      el.textContent?.includes('Child 1'),
    ) as HTMLElement;
    const cb = child1Row.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await fireEvent.click(cb);
    expect(received).toEqual(['v-child-1']);
  });

  it('受控 value：传入节点 value（非 key）能正确回显选中态', () => {
    const { container } = renderWithLocale(Tree, {
      props: {
        treeData: treeDataWithValue,
        defaultExpandAll: true,
        value: 'v-child-2',
      },
    });
    const child2 = Array.from(container.querySelectorAll('[role="treeitem"]')).find((el) =>
      el.textContent?.includes('Child 2'),
    );
    expect(child2?.getAttribute('aria-selected')).toBe('true');
  });
});
