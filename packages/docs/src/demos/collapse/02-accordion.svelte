<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';

  const panels = [
    { key: '1', header: '问题一：如何开始使用？' },
    { key: '2', header: '问题二：支持哪些框架？' },
    { key: '3', header: '问题三：如何自定义主题？' },
  ];
</script>

<Collapse {panels} accordion defaultActiveKey="1">
  {#snippet children({ key })}
    {#if key === '1'}
      <p>按照文档安装依赖后即可直接使用组件。</p>
    {:else if key === '2'}
      <p>目前支持 Svelte 5+，持续扩展中。</p>
    {:else}
      <p>通过修改 Design Token 即可实现品牌定制。</p>
    {/if}
  {/snippet}
</Collapse>
