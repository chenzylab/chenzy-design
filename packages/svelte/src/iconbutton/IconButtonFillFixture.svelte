<!--
  测试夹具：捕获 IconButton 传给 icon snippet 的 fill 参数，写入 data-fill 便于断言。
  用于验证 colorful multipleColor/twoColor fill 注入（对齐 Semi cloneElement 注入）。
-->
<script lang="ts">
  import IconButton from './IconButton.svelte';
  import type { ButtonType, ButtonTheme } from '../button/context.js';

  let {
    type,
    theme,
    disabled = false,
  }: { type: ButtonType; theme: ButtonTheme; disabled?: boolean } = $props();
</script>

<IconButton {type} {theme} {disabled} colorful aria-label="x">
  {#snippet icon({ fill })}
    <span data-testid="fill-probe" data-fill={JSON.stringify(fill ?? null)}></span>
  {/snippet}
</IconButton>
