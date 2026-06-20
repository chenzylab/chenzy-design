<!--
  FieldArray (Form.List) — 动态字段数组：增/删/重排子表单项。
  本地维护行标识 items（{ key }[]），children snippet 渲染每行；
  子字段用拼接键 `${name}.${item.key}.${sub}` 走普通 Field（core 扁平键天然支持校验）。
  remove 时清理该行所有子字段值（setFieldValue undefined），避免提交残留。
  不依赖 core 的嵌套路径支持，自包含（红线 #1：不写回 props，状态本地 $state）。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { getFormContext } from './context.js';

  interface ArrayItem {
    /** 稳定行标识，用于拼接子字段名与 each key */
    key: string;
  }
  interface ChildArgs {
    items: ArrayItem[];
    /** 拼接某行某子字段的完整 field 名 */
    name: (item: ArrayItem, sub: string) => string;
    add: () => void;
    remove: (item: ArrayItem) => void;
    move: (from: number, to: number) => void;
  }

  interface Props {
    /** 数组字段名（子字段前缀） */
    name: string;
    /** 初始行数 */
    initialCount?: number;
    children?: Snippet<[ChildArgs]>;
  }

  let { name, initialCount = 0, children }: Props = $props();

  const ctx = getFormContext();
  if (!ctx) throw new Error('<Form.List> must be used inside <Form>');
  const { form } = ctx;

  function newKey(): string {
    return useId(`${name}-row`);
  }
  function getInitial(): ArrayItem[] {
    return Array.from({ length: Math.max(0, initialCount) }, () => ({ key: newKey() }));
  }
  let items = $state<ArrayItem[]>(untrack(getInitial));

  function add() {
    items = [...items, { key: newKey() }];
  }
  function remove(item: ArrayItem) {
    // 清理该行所有子字段值（前缀匹配），避免提交残留
    const prefix = `${name}.${item.key}.`;
    const values = form.getState().values;
    for (const k of Object.keys(values)) {
      if (k.startsWith(prefix)) form.setFieldValue(k, undefined);
    }
    items = items.filter((it) => it.key !== item.key);
  }
  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved as ArrayItem);
    items = next;
  }

  function fieldName(item: ArrayItem, sub: string): string {
    return `${name}.${item.key}.${sub}`;
  }
</script>

<div class="cd-field-array">
  {@render children?.({ items, name: fieldName, add, remove, move })}
</div>
