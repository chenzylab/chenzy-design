<!--
  List a11y 夹具：数据驱动渲染真实 ul/li 列表（对齐 Semi 结构）。
  renderItem 返回 <List.Item>，含 main/extra 模板结构，便于 axe 校验。
-->
<script lang="ts">
  import { List, ListItem } from './index.js';

  interface Props {
    bordered?: boolean;
    header?: string;
    footer?: string;
    empty?: boolean;
  }
  let { bordered = false, header, footer, empty = false }: Props = $props();

  const data = $derived(
    empty
      ? []
      : [
          { key: 'u1', name: 'Alan Turing', role: 'Mathematician' },
          { key: 'u2', name: 'Grace Hopper', role: 'Computer Scientist' },
          { key: 'u3', name: 'Ada Lovelace', role: 'Analyst' },
        ],
  );
</script>

<List
  dataSource={data}
  {bordered}
  {...header !== undefined ? { header } : {}}
  {...footer !== undefined ? { footer } : {}}
>
  {#snippet renderItem(item)}
    {@const d = item as { name: string; role: string }}
    <ListItem main={d.name} extra={d.role} />
  {/snippet}
</List>
