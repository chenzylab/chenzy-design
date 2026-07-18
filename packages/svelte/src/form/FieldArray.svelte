<!--
  FieldArray (Form.List) — 动态字段数组：增/删/重排子表单项，对齐 Semi ArrayField。
  子字段名用真下标 `${name}[${index}].${sub}`（非随机 key），提交产物是真数组
  `{ users: [{ name, age }] }`（对齐 Semi，非扁平键）。
  add/remove/move 直接对 core 里 `name` 下的数组值做 splice/reorder，剩余行按新
  下标重读值 → 下标自动重排。渲染用稳定 key 做 each key（DOM 不闪），name 由位置算。
  红线 #1：不写回 props，行标识本地 $state。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { getFormContext } from './context.js';

  interface ArrayItem {
    /** 稳定行标识，仅用于 each key（DOM 稳定）；字段名由位置下标算，不用它 */
    key: string;
  }
  interface RowArgs {
    /** 稳定行标识（each key） */
    key: string;
    /** 该行下标 */
    index: number;
    /** 拼接该行某子字段的完整 field 名：`name[index].sub` */
    name: (sub: string) => string;
    /** 删除本行 */
    remove: () => void;
  }
  interface ChildArgs {
    /** 每行的 { key, index, name, remove }，供 {#each} 渲染 */
    arrayFields: RowArgs[];
    /** 兼容旧 API：行数组（{ key }[]） */
    items: ArrayItem[];
    /** 兼容旧 API：拼接某行某子字段名（按行对象取下标） */
    name: (item: ArrayItem, sub: string) => string;
    /** 末尾追加空行；传 index 则在该位置插入 */
    add: (index?: number) => void;
    /** 用初始行对象追加/插入（对齐 Semi addWithInitValue） */
    addWithInitValue: (rowVal: Record<string, unknown>, index?: number) => void;
    /** 兼容旧 API：删除某行 */
    remove: (item: ArrayItem) => void;
    /** 交换/移动两行位置 */
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
  // 行标识列表：顺序即下标。add/remove/move 同步维护它 + core 里的数组值。
  let items = $state<ArrayItem[]>(untrack(getInitial));

  /** 读取 core 里 name 下的数组值（不存在则空数组）。 */
  function readArray(): unknown[] {
    const v = form.getValue(name);
    return Array.isArray(v) ? v.slice() : [];
  }

  function indexOf(item: ArrayItem): number {
    return items.findIndex((it) => it.key === item.key);
  }

  /** 末尾追加空行；传 index 则在该位置插入（对齐 Semi add(index?)）。 */
  function add(index?: number) {
    const key = newKey();
    if (typeof index === 'number') {
      const safe = Math.max(0, Math.min(index, items.length));
      const next = items.slice();
      next.splice(safe, 0, { key });
      items = next;
      // 在数组值同位置插入空槽，使后续行下标读到新位置
      const arr = readArray();
      arr.splice(safe, 0, undefined);
      form.setValue(name, arr);
    } else {
      items = [...items, { key }];
    }
  }

  /** 用初始行对象追加/插入（对齐 Semi addWithInitValue(rowVal, index?)）。 */
  function addWithInitValue(rowVal: Record<string, unknown>, index?: number) {
    const key = newKey();
    const arr = readArray();
    const next = items.slice();
    if (typeof index === 'number') {
      const safe = Math.max(0, Math.min(index, items.length));
      next.splice(safe, 0, { key });
      arr.splice(safe, 0, { ...rowVal });
    } else {
      next.push({ key });
      arr.push({ ...rowVal });
    }
    items = next;
    form.setValue(name, arr);
  }

  /** 删除某行：从行列表 + 数组值同步 splice，剩余行下标自动前移。 */
  function removeAt(i: number) {
    if (i < 0 || i >= items.length) return;
    const next = items.slice();
    next.splice(i, 1);
    items = next;
    const arr = readArray();
    if (i < arr.length) {
      arr.splice(i, 1);
      form.setValue(name, arr);
    }
  }
  function remove(item: ArrayItem) {
    removeAt(indexOf(item));
  }

  /** 移动/交换行：行列表 + 数组值同步重排。 */
  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved as ArrayItem);
    items = next;
    const arr = readArray();
    // 数组值可能比行少（尚未填值），补齐到行长再重排，避免错位
    while (arr.length < items.length) arr.push(undefined);
    const [movedVal] = arr.splice(from, 1);
    arr.splice(to, 0, movedVal);
    form.setValue(name, arr);
  }

  /** 旧 API：按行对象拼接子字段名（转成真下标）。 */
  function fieldNameByItem(item: ArrayItem, sub: string): string {
    return `${name}[${indexOf(item)}].${sub}`;
  }

  // 每行 { key, index, name, remove }，name 用真下标（对齐 Semi arrayFields）。
  const arrayFields = $derived<RowArgs[]>(
    items.map((it, i) => ({
      key: it.key,
      index: i,
      name: (sub: string) => `${name}[${i}].${sub}`,
      remove: () => removeAt(i),
    })),
  );
</script>

<div class="cd-field-array">
  {@render children?.({
    arrayFields,
    items,
    name: fieldNameByItem,
    add,
    addWithInitValue,
    remove,
    move,
  })}
</div>
