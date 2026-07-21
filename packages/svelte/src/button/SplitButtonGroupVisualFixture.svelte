<!--
  SplitButtonGroup 视觉回归 fixture：一张图覆盖 solid / light / borderless 三组分裂按钮。
  每组 = 主按钮 + 箭头按钮（纯图标），锁住 SplitButtonGroup 的关键视觉：
    - 主按钮与箭头之间 1px 细缝（对齐 Semi，曾误为 ~5px inline 空白间隙）
    - 首按钮左圆角、末按钮右圆角、中缝直角
  不套 Dropdown，聚焦布局本身，避免浮层/异步影响截图稳定性。
  仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Button } from './index.js';
  import SplitButtonGroup from './SplitButtonGroup.svelte';
  import { IconTreeTriangleDown } from '@chenzy-design/icons';

  const themes = ['solid', 'light', 'borderless'] as const;
</script>

{#snippet caret()}<IconTreeTriangleDown />{/snippet}

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:10px; padding:16px; background:#fff; align-items:center;"
  >
    {#each themes as theme (theme)}
      <SplitButtonGroup ariaLabel="Project actions">
        <Button {theme} type="primary">Split</Button>
        <Button {theme} type="primary" icon={caret} ariaLabel="More"></Button>
      </SplitButtonGroup>
    {/each}
  </div>
</LocaleProvider>
