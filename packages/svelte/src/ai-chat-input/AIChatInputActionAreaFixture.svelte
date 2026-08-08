<!--
  测试夹具：验证 renderActionArea 的「整块替换 + 回传 menuItem/className」语义
  （对齐 Semi ActionAreaProps）。自定义内容里既有自己的按钮，也渲染 menuItem，
  用于断言内置的发送按钮不会因为自定义而丢失。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import AIChatInput from './AIChatInput.svelte';
</script>

<AIChatInput canSend {renderActionArea} />

{#snippet renderActionArea({ menuItem, className }: { menuItem: Snippet; className: string })}
  <div class={className} data-testid="custom-action">
    <button type="button" data-testid="extra-btn">额外</button>
    {@render menuItem()}
  </div>
{/snippet}
