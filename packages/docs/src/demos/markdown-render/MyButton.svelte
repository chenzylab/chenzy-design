<script lang="ts">
  // demo「添加自定义组件」用：在 Markdown 中渲染一个带 JS 事件的按钮（对齐 Semi components['MyButton']）。
  import type { Snippet } from 'svelte';
  import { Button } from '@chenzy-design/svelte';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }
  let { children }: Props = $props();

  function handleClick() {
    // eslint-disable-next-line no-alert
    alert('点击了 MyButton');
  }
</script>

<Button type="primary" onclick={handleClick} style="margin-bottom: 12px">
  {#if children}{@render children()}{/if}
</Button>
