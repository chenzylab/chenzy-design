<!--
  测试夹具：ButtonGroup(theme=groupTheme) > Button（不传 theme）。
  用于验证「ButtonGroup 上下文 > cdGlobal 全局默认」的优先级（见 Button.global.a11y.test.ts）。
-->
<script lang="ts">
  import Button from './Button.svelte';
  import ButtonGroup from './ButtonGroup.svelte';
  import type { ButtonTheme } from './context.js';

  let { groupTheme }: { groupTheme: ButtonTheme } = $props();
</script>

<ButtonGroup theme={groupTheme}>
  <Button aria-label="child">child</Button>
</ButtonGroup>
