<script lang="ts">
  // demo「添加自定义组件」用：在 Markdown 中渲染一个带 JS 事件的按钮（对齐 Semi components['MyButton']）。
  import type { Snippet } from 'svelte';
  import { Button } from '@chenzy-design/svelte';

  interface Props {
    children?: Snippet;
    [key: string]: unknown;
  }
  let { children }: Props = $props();

  // Semi 原 demo 用 alert 演示「JS 事件确实生效」。本库改为就地文字反馈：
  // alert 是模态对话框，会阻塞页面上所有后续脚本与自动化（真机验证时直接冻住标签页），
  // 同 avatar demo 早先去 alert 的处理。演示目的（点击触发 JS）完全等价。
  let clicked = $state(0);
</script>

<Button type="primary" onclick={() => (clicked += 1)} style="margin-bottom: 12px">
  {#if children}{@render children()}{/if}
</Button>
{#if clicked > 0}
  <span data-testid="click-feedback" style="margin-left: 8px; color: var(--cd-color-success);">
    点击了 MyButton（{clicked} 次）
  </span>
{/if}
