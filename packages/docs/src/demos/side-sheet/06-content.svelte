<script lang="ts">
  import { SideSheet, Button, Title, Text } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = true)}>More Information</Button>
<SideSheet
  {visible}
  onCancel={() => (visible = false)}
  closeIcon={null}
  headerStyle="border-bottom:1px solid var(--cd-color-border)"
  bodyStyle="border-bottom:1px solid var(--cd-color-border)"
>
  {#snippet titleSnippet()}
    <Title heading={4}>创建资源包</Title>
  {/snippet}

  <div style="display:flex; flex-direction:column; gap:16px">
    <Text strong>目标操作系统</Text>
    <Text type="tertiary">
      通过自定义 titleSnippet、footer、headerStyle / bodyStyle 等，可创建出丰富的内容样式。
    </Text>
  </div>

  {#snippet footer({ close })}
    <div style="display:flex; justify-content:flex-end; gap:8px">
      <Button onclick={close}>重置</Button>
      <Button theme="solid" onclick={close}>提交</Button>
    </div>
  {/snippet}
</SideSheet>
