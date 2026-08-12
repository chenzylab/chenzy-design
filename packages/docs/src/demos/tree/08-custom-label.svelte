<script lang="ts">
  import { Tree, ButtonGroup, Button, Toast } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

  function onTip(e: MouseEvent) {
    Toast.info({ content: 'Hi, Bytedance dance dance', duration: 3 });
    e.stopPropagation();
  }
</script>

{#snippet nodeLabel(text: string)}
  <div style="display:flex; justify-content:space-between; align-items:center">
    <span>{text}</span>
    <ButtonGroup size="small" theme="borderless">
      <Button onClick={onTip}>提示</Button>
      <Button>点击</Button>
    </ButtonGroup>
  </div>
{/snippet}

{#snippet asiaLabel()}{@render nodeLabel('亚洲')}{/snippet}
{#snippet chinaLabel()}{@render nodeLabel('中国')}{/snippet}
{#snippet japanLabel()}{@render nodeLabel('日本')}{/snippet}

<Tree
  treeData={[
    {
      label: asiaLabel,
      value: 'yazhou',
      key: 'yazhou',
      children: [
        { label: chinaLabel, value: 'zhongguo', key: 'zhongguo' },
        { label: japanLabel, value: 'riben', key: 'riben' },
      ],
    },
  ] as unknown as TreeNodeData[]}
  style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)"
/>
