<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  const sections = [
    { id: 'dcl-guide', label: '指南' },
    { id: 'dcl-install', label: '安装' },
    { id: 'dcl-usage', label: '使用' },
    { id: 'dcl-api', label: 'API' },
    { id: 'dcl-faq', label: '常见问题（禁用）' },
  ];

  let scrollBox = $state<HTMLElement | null>(null);
</script>

<Text type="tertiary">
  声明式 &lt;Anchor.Link&gt; 子组件写法（嵌套 + disabled）；railTheme=tertiary、size=small。
</Text>
<div style="display: flex; gap: 24px; align-items: flex-start; margin-block-start: 8px">
  <div style="width: 160px">
    <Anchor
      railTheme="tertiary"
      size="small"
      maxWidth={160}
      getContainer={() => scrollBox}
    >
      <Anchor.Link href="#dcl-guide" title="指南">
        <Anchor.Link href="#dcl-install" title="安装" />
        <Anchor.Link href="#dcl-usage" title="使用" />
      </Anchor.Link>
      <Anchor.Link href="#dcl-api" title="API" />
      <Anchor.Link href="#dcl-faq" title="常见问题" disabled />
    </Anchor>
  </div>
  <div
    bind:this={scrollBox}
    style="height: 220px; overflow: auto; flex: 1; border: 1px solid var(--cd-color-border); border-radius: 8px; padding: 12px"
  >
    {#each sections as s (s.id)}
      <div id={s.id} style="min-height: 130px">
        <Text strong>{s.label}</Text>
        <Text type="tertiary">滚动观察声明式锚点的高亮联动。</Text>
      </div>
    {/each}
  </div>
</div>
