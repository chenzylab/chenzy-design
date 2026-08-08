<!--
  测试夹具：ButtonGroup 内渲染 3 个 Button，每个 theme 可独立指定（对齐 Semi 允许组内混用 theme）。
  用于验证分隔线插入逻辑（见 ButtonGroup.a11y.test.ts）。
-->
<script lang="ts">
  import Button from './Button.svelte';
  import ButtonGroup from './ButtonGroup.svelte';
  import type { ButtonTheme } from './context.js';

  let { themes }: { themes: [ButtonTheme, ButtonTheme, ButtonTheme] } = $props();
</script>

<ButtonGroup aria-label="group">
  <Button theme={themes[0]} aria-label="a">A</Button>
  <Button theme={themes[1]} aria-label="b">B</Button>
  <Button theme={themes[2]} aria-label="c">C</Button>
</ButtonGroup>
