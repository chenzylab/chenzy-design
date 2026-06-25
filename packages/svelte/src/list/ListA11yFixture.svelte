<!--
  仅供 List.a11y.test.ts 使用的测试夹具：数据驱动 dataSource + renderItem Snippet。
  selectable 时容器升级 role=listbox，行 role=option + aria-selected。
-->
<script lang="ts">
  import { List } from './index.js';

  interface Props {
    selectable?: false | 'single' | 'multiple';
    bordered?: boolean;
    header?: string;
    defaultSelectedKeys?: (string | number)[];
  }
  let {
    selectable = false,
    bordered = false,
    header = undefined,
    defaultSelectedKeys = [],
  }: Props = $props();

  const dataSource = [
    { key: 'u1', title: 'Ada Lovelace' },
    { key: 'u2', title: 'Alan Turing' },
    { key: 'u3', title: 'Grace Hopper' },
  ];
</script>

<List
  {dataSource}
  {selectable}
  {bordered}
  {defaultSelectedKeys}
  {...header !== undefined ? { header } : {}}
>
  {#snippet renderItem(item)}
    <span>{(item as { title: string }).title}</span>
  {/snippet}
</List>
