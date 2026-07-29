<!--
  NavCollapseButton — 收起/展开侧边栏按钮（对齐 Semi CollapseButton.tsx）。
  DOM：div.cd-nav__collapse-btn >
    - 折叠态：Tooltip(content=展开文案, position=right) 包裹 span.cd-nav__collapse-wrapper > Button(icon=IconSidebar)
    - 展开态：Button(icon=IconSidebar, type=tertiary, theme=borderless) 内含 collapseText 文案
  文案：collapseText(isCollapsed) 优先，否则 locale.expandText/collapseText。
-->
<script lang="ts">
  import { useLocale } from '../locale-provider/index.js';
  import Button from '../button/Button.svelte';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import { IconSidebar } from '@chenzy-design/icons';

  interface Props {
    /** 是否折叠态。 */
    isCollapsed?: boolean;
    /** 文案自定义（对齐 Semi collapseText，(isCollapsed)=>string）。 */
    collapseText?: (isCollapsed: boolean) => string;
    /** 点击回调，收到目标折叠态（对齐 Semi onClick(!isCollapsed)）。 */
    onClick?: (next: boolean) => void;
  }

  let { isCollapsed = false, collapseText, onClick }: Props = $props();

  const loc = useLocale();

  function handleClick(): void {
    onClick?.(!isCollapsed);
  }

  // 折叠态显示「展开」文案，展开态显示「收起」文案（对齐 Semi expandText/collapseText）。
  const finalText = $derived(
    collapseText
      ? collapseText(isCollapsed)
      : isCollapsed
        ? loc().t('Navigation.expandText')
        : loc().t('Navigation.collapseText'),
  );
</script>

{#snippet sidebarIcon()}
  <IconSidebar />
{/snippet}

<div class="cd-nav__collapse-btn">
  {#if isCollapsed}
    <Tooltip content={finalText} position="right">
      <span class="cd-nav__collapse-wrapper">
        <Button
          icon={sidebarIcon}
          type="tertiary"
          theme="borderless"
          ariaLabel={finalText}
          onclick={handleClick}
        />
      </span>
    </Tooltip>
  {:else}
    <Button icon={sidebarIcon} type="tertiary" theme="borderless" onclick={handleClick}>
      {finalText}
    </Button>
  {/if}
</div>

<style>
  .cd-nav__collapse-btn {
    display: flex;
    align-items: center;
    inline-size: 100%;
  }
  .cd-nav__collapse-wrapper {
    display: inline-flex;
  }
</style>
